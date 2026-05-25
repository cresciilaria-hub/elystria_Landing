// ============================================================================
//  ELYSTRIA — Funzione Serverless di registrazione (invio email via BREVO)
//  Percorso: /api/register.js  (Vercel la espone automaticamente su /api/register)
// ----------------------------------------------------------------------------
//  COSA FA:
//   1. Riceve { email, lang } dal form della pagina index.html (la landing)
//   2. Decide se l'iscritto è tra i "primi 50" (conteggio FITTIZIO, in memoria)
//   3. Invia un'email VERA tramite Brevo, con testo diverso per vincitore/standard
//   4. Risponde al frontend con { ok:true, winner:true|false }
//
//  PERCHÉ BREVO: permette di verificare un SINGOLO indirizzo email come mittente
//  (con un codice via email), senza configurare alcun record DNS. Così l'email
//  arriva a CHIUNQUE si iscriva — professore compreso.
//
//  COSA TI SERVE SU VERCEL (vedi FOGLIO_ISTRUZIONI.md):
//   - Variabile d'ambiente  BREVO_API_KEY   (la API key del tuo account Brevo)
//   - Variabile d'ambiente  MAIL_FROM       (il mittente VERIFICATO su Brevo,
//                                             es. "Elystria <growup.agency.elystria@gmail.com>")
//
//  IMPORTANTE: su Brevo serve la "API key" (per le chiamate REST), NON la "SMTP key":
//  sono due credenziali diverse. Usare quella sbagliata è l'errore più comune.
//  La chiave NON va mai scritta qui dentro. Resta su Vercel come env var.
// ============================================================================

// Soglia "primi N" (fittizia). Cambia qui il numero se vuoi.
const SOGLIA_VINCITORI = 50;

// (Opzionale) Punto di partenza del contatore. Lascia 0 per una demo normale.
// Per la presentazione puoi farlo partire "vicino al 50" — impostando su Vercel la env var
// START_COUNT (es. 49) — così con poche iscrizioni mostri sia il caso "vincitore"
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

// Mittente VERIFICATO su Brevo, letto dalla env var MAIL_FROM.
// Formato accettato: "Nome <indirizzo@dominio>" oppure solo "indirizzo@dominio".
// Esempio: Elystria <growup.agency.elystria@gmail.com>
const MAIL_FROM = process.env.MAIL_FROM || 'Elystria <onboarding@example.com>';

// URL pubblico del sito, per le immagini dentro l'email (devono stare online,
// non possono essere file locali). Di default usa il dominio Vercel del progetto;
// se cambia, imposta la env var SITE_URL su Vercel (senza "/" finale).
const SITE_URL = (process.env.SITE_URL || 'https://elystria-landing.vercel.app').replace(/\/$/, '');

// Estrae nome ed email dal valore di MAIL_FROM (Brevo li vuole separati).
function parseFrom(raw) {
  const m = raw.match(/^\s*(.*?)\s*<\s*([^>]+?)\s*>\s*$/);
  if (m) return { name: m[1] || 'Elystria', email: m[2] };
  return { name: 'Elystria', email: raw.trim() };
}

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

// ---- Template HTML dell'email (stile oro-su-nero del sito, con immagini) ----
// Sanifica il nome per inserirlo nell'HTML senza rischi (toglie < > &).
function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function buildHtml(t, firstName, lang, winner) {
  const ciao = lang === 'en' ? 'Hi' : 'Ciao';
  const nome = escapeHtml(firstName);
  const greeting = nome ? `${ciao} ${nome},` : (lang === 'en' ? 'Hi,' : 'Ciao,');
  const ctaLabel = lang === 'en' ? 'Explore the collection' : 'Scopri la collezione';

  // Blocco immagine: per i vincitori mostriamo la foto dell'action figure di Zython.
  const figureBlock = winner ? `
      <tr><td style="padding:0 0 24px">
        <img src="${SITE_URL}/assets/figure-zython.jpg" alt="Action figure Zython" width="280"
             style="display:block;margin:0 auto;border-radius:10px;border:1px solid rgba(230,192,104,0.25)">
      </td></tr>` : '';

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0810;font-family:Georgia,'Times New Roman',serif;color:#f0ead8">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0810">
    <tr><td align="center" style="padding:36px 16px">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

        <!-- LOGO -->
        <tr><td align="center" style="padding-bottom:8px">
          <img src="${SITE_URL}/assets/logo-email.jpg" alt="Elystria" width="240" style="display:block">
        </td></tr>
        <tr><td align="center" style="padding-bottom:26px">
          <div style="font-size:13px;color:#9c7a32;font-style:italic;letter-spacing:2px">La Fiamma Primordiale</div>
        </td></tr>

        <!-- CARD -->
        <tr><td style="border:1px solid rgba(230,192,104,0.25);border-radius:14px;background:#0d0b14;padding:34px 30px">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-size:16px;color:#f0ead8;padding-bottom:12px">${greeting}</td></tr>
            <tr><td align="center" style="font-size:38px;padding-bottom:6px">🔥</td></tr>
            <tr><td align="center" style="font-family:Georgia,serif;font-size:22px;color:#f8e4b0;font-weight:bold;padding-bottom:14px">${t.heading}</td></tr>
            <tr><td align="center" style="font-size:16px;color:#c4baa4;line-height:1.5;padding-bottom:16px">${t.lead}</td></tr>
            ${figureBlock}
            <tr><td align="center" style="font-size:17px;color:#ffce4d;font-weight:bold;line-height:1.5;padding-bottom:22px">${t.prize}</td></tr>
            <tr><td align="center" style="padding-bottom:20px">
              <a href="${SITE_URL}/shop.html" style="display:inline-block;background:#e6c068;color:#0a0810;text-decoration:none;font-family:Georgia,serif;font-weight:bold;font-size:14px;letter-spacing:1px;padding:14px 30px;border-radius:6px">${ctaLabel}</a>
            </td></tr>
            <tr><td align="center" style="font-size:14px;color:#9c7a32;font-style:italic">${t.foot}</td></tr>
          </table>
        </td></tr>

        <!-- FOOTER -->
        <tr><td align="center" style="padding-top:22px">
          <div style="font-size:12px;color:#9c7a32;opacity:0.8">Progetto scolastico dimostrativo · GrowUp Agency · Ilaria, Martina e Jolanda</div>
        </td></tr>

      </table>
    </td></tr>
  </table>
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
  const firstName = (body && body.firstName ? String(body.firstName) : '').trim().slice(0, 60);
  const lastName = (body && body.lastName ? String(body.lastName) : '').trim().slice(0, 60);
  const lang = body && body.lang === 'en' ? 'en' : 'it';

  // validazione: nome, cognome ed email obbligatori
  if (!firstName || !lastName) {
    return res.status(400).json({ ok: false, error: 'required' });
  }

  // validazione email lato server
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return res.status(400).json({ ok: false, error: 'invalid_email' });
  }

  // chiave Brevo dalla env var (mai nel codice)
  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  if (!BREVO_API_KEY) {
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

  // prepara i testi e il mittente
  const t = winner ? emailVincitore(lang) : emailStandard(lang);
  const sender = parseFrom(MAIL_FROM);

  // invia l'email tramite l'API di Brevo (endpoint REST /v3/smtp/email)
  try {
    const r = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: { name: sender.name, email: sender.email },
        to: [{ email: email, name: (firstName + ' ' + lastName).trim() }],
        subject: t.subject,
        htmlContent: buildHtml(t, firstName, lang, winner)
      })
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('Brevo error:', r.status, detail);
      // se l'email non parte e l'iscritto era NUOVO, annulliamo l'incremento
      // così il conteggio resta coerente (i doppioni non avevano inciso comunque)
      if (!giaVista) conteggioIscritti -= 1;
      // Causa tipica: il mittente (MAIL_FROM) non è ancora VERIFICATO su Brevo.
      // Restituiamo un codice dedicato così il form mostra un messaggio chiaro.
      const lower = (detail || '').toLowerCase();
      if (lower.includes('sender') && (lower.includes('not') || lower.includes('valid'))) {
        return res.status(403).json({ ok: false, error: 'sender_not_verified' });
      }
      return res.status(502).json({ ok: false, error: 'email_failed' });
    }

    // email inviata: ora che è andata a buon fine, memorizziamo l'esito
    // (solo se era un iscritto nuovo) per gestire eventuali reiscrizioni
    if (!giaVista) emailViste.set(chiave, { winner, position });

    return res.status(200).json({ ok: true, winner, position });
  } catch (err) {
    console.error('Network/Brevo exception:', err);
    if (!giaVista) conteggioIscritti -= 1;
    return res.status(502).json({ ok: false, error: 'email_failed' });
  }
}
