// ============================================================================
//  ELYSTRIA — Funzione Serverless di registrazione
//  Percorso: /api/register.js  (Vercel la espone automaticamente su /api/register)
// ----------------------------------------------------------------------------
//  COSA FA:
//   1. Riceve { email, lang } dal form della pagina registrati.html
//   2. Decide se l'iscritto è tra i "primi 50" (conteggio FITTIZIO, in memoria)
//   3. Invia un'email VERA tramite Resend, con testo diverso per vincitore/standard
//   4. Risponde al frontend con { ok:true, winner:true|false }
//
//  COSA TI SERVE SU VERCEL (vedi FOGLIO_ISTRUZIONI_LANDING.md):
//   - Variabile d'ambiente  RESEND_API_KEY   (la chiave del tuo account Resend)
//   - Variabile d'ambiente  MAIL_FROM        (il mittente del TUO dominio verificato,
//                                              es. "Elystria <noreply@iltuodominio.it>")
//
//  NOTA: la chiave NON va mai scritta qui dentro. Resta su Vercel come env var.
// ============================================================================

// Soglia "primi N" (fittizia). Cambia qui il numero se vuoi.
const SOGLIA_VINCITORI = 50;

// (Opzionale) Punto di partenza del contatore. Lascia 0 per una demo normale.
// Per la presentazione puoi farlo partire "vicino al 50" — impostando su Vercel la env var
// START_COUNT (es. 48) — così con poche iscrizioni mostri sia il caso "vincitore"
// sia il caso "3 livelli gratis" senza dover fare 50 iscrizioni vere.
const START_COUNT = parseInt(process.env.START_COUNT || '0', 10) || 0;

// Contatore in memoria. ATTENZIONE: non è un database.
// Su Vercel può azzerarsi quando la funzione viene "riavviata" (cold start).
// Per la presentazione va benissimo: vedi spiegazione nel foglio istruzioni.
let conteggioIscritti = START_COUNT;

// Memoria delle email già iscritte in questa sessione del server.
// Serve a evitare i doppioni: se la stessa persona si reiscrive, NON viene contata
// di nuovo e riceve lo stesso esito di prima (niente numeri sballati durante la demo).
const emailViste = new Map(); // email(minuscolo) -> { winner, position }

// Mittente: il tuo dominio verificato su Resend, letto dalla env var MAIL_FROM.
// Se per qualche motivo la variabile manca, ripieghiamo sull'indirizzo di test di Resend
// (che però invia solo all'email del tuo account Resend) per non lasciare il form rotto.
const FROM = process.env.MAIL_FROM || 'Elystria <onboarding@resend.dev>';

// ---- Testi email (IT/EN) -------------------------------------------------
function emailVincitore(lang) {
  if (lang === 'en') {
    return {
      subject: '🏆 You\'re one of the first 50 — your Elystria reward',
      heading: 'Congratulations, bearer of the Flame!',
      lead: 'You are among the first 50 to sign up for Elystria — The Primordial Flame.',
      prize: 'You\'ve won the collector\'s ACTION FIGURE of Zython, the First Devourer.',
      foot: 'We\'ll be in touch with the details to claim your figure.'
    };
  }
  return {
    subject: '🏆 Sei tra i primi 50 — la tua ricompensa di Elystria',
    heading: 'Complimenti, portatore della Fiamma!',
    lead: 'Sei tra i primi 50 iscritti a Elystria — La Fiamma Primordiale.',
    prize: 'Hai vinto l\'ACTION FIGURE da collezione di Zython, il Primo Divoratore.',
    foot: 'Ti contatteremo con i dettagli per ricevere la tua figure.'
  };
}

function emailStandard(lang) {
  if (lang === 'en') {
    return {
      subject: '🎮 Welcome to Elystria — your first 3 levels are free',
      heading: 'Welcome to Elystria!',
      lead: 'Thank you for signing up to Elystria — The Primordial Flame.',
      prize: 'You\'ve unlocked the first 3 LEVELS of the game completely free.',
      foot: 'We\'ll send your access details soon. May the Flame guide you.'
    };
  }
  return {
    subject: '🎮 Benvenuto in Elystria — i tuoi primi 3 livelli gratis',
    heading: 'Benvenuto in Elystria!',
    lead: 'Grazie per esserti iscritto a Elystria — La Fiamma Primordiale.',
    prize: 'Hai sbloccato i primi 3 LIVELLI del gioco completamente gratis.',
    foot: 'Ti invieremo presto i dettagli di accesso. Che la Fiamma ti guidi.'
  };
}

// ---- Template HTML dell'email (stile oro-su-nero del sito) ----------------
function buildHtml(t) {
  return `<!DOCTYPE html>
<html><body style="margin:0;background:#0a0810;font-family:Georgia,'Times New Roman',serif;color:#f0ead8">
  <div style="max-width:560px;margin:0 auto;padding:40px 28px">
    <div style="text-align:center;margin-bottom:28px">
      <div style="font-family:Georgia,serif;font-size:26px;letter-spacing:6px;color:#f8e4b0;font-weight:bold">ELYSTRIA</div>
      <div style="font-size:14px;color:#9c7a32;font-style:italic;letter-spacing:1px">La Fiamma Primordiale</div>
    </div>
    <div style="border:1px solid rgba(230,192,104,0.25);border-radius:12px;background:#0d0b14;padding:36px 30px;text-align:center">
      <div style="font-size:40px;margin-bottom:14px">🔥</div>
      <h1 style="font-family:Georgia,serif;font-size:22px;color:#f8e4b0;margin:0 0 16px;font-weight:bold">${t.heading}</h1>
      <p style="font-size:16px;color:#c4baa4;margin:0 0 18px;line-height:1.5">${t.lead}</p>
      <p style="font-size:17px;color:#ffce4d;font-weight:bold;margin:0 0 18px;line-height:1.5">${t.prize}</p>
      <p style="font-size:14px;color:#9c7a32;font-style:italic;margin:18px 0 0">${t.foot}</p>
    </div>
    <p style="text-align:center;font-size:12px;color:#9c7a32;margin-top:24px;opacity:0.8">
      Progetto scolastico dimostrativo · GrowUp Agency · Ilaria, Martina e Jolanda
    </p>
  </div>
</body></html>`;
}

// ---- Handler -------------------------------------------------------------
export default async function handler(req, res) {
  // accetta solo POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  // legge il body (Vercel lo passa già come oggetto, ma gestiamo anche stringa)
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const email = (body && body.email ? String(body.email) : '').trim();
  const lang = body && body.lang === 'en' ? 'en' : 'it';

  // validazione email lato server
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return res.status(400).json({ ok: false, error: 'invalid_email' });
  }

  // chiave Resend dalla env var (mai nel codice)
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    // così, se manca la chiave, capisci subito il perché dai log di Vercel
    return res.status(500).json({ ok: false, error: 'missing_api_key' });
  }

  // ANTI-DOPPIONE: se questa email si è già iscritta in questa sessione,
  // NON la contiamo di nuovo. Le rimandiamo lo stesso esito di prima e
  // (per comodità) le rispediamo l'email, senza far salire il contatore.
  const chiave = email.toLowerCase();
  const giaVista = emailViste.get(chiave);

  // decide vincitore/standard (conteggio fittizio in memoria)
  let winner, position;
  if (giaVista) {
    winner = giaVista.winner;
    position = giaVista.position;
  } else {
    conteggioIscritti += 1;
    position = conteggioIscritti;
    winner = position <= SOGLIA_VINCITORI;
  }

  // prepara i testi
  const t = winner ? emailVincitore(lang) : emailStandard(lang);

  // invia l'email tramite l'API di Resend
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: t.subject,
        html: buildHtml(t)
      })
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('Resend error:', r.status, detail);
      // se l'email non parte e l'iscritto era NUOVO, annulliamo l'incremento
      // così il conteggio resta coerente (i doppioni non avevano inciso comunque)
      if (!giaVista) conteggioIscritti -= 1;
      return res.status(502).json({ ok: false, error: 'email_failed' });
    }

    // email inviata: ora che è andata a buon fine, memorizziamo l'esito
    // (solo se era un iscritto nuovo) per gestire eventuali reiscrizioni
    if (!giaVista) emailViste.set(chiave, { winner, position });

    return res.status(200).json({ ok: true, winner, position });
  } catch (err) {
    console.error('Network/Resend exception:', err);
    if (!giaVista) conteggioIscritti -= 1;
    return res.status(502).json({ ok: false, error: 'email_failed' });
  }
}
