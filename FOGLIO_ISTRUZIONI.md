# FOGLIO ISTRUZIONI — Landing, Email (Brevo) e Shop

Questo foglio spiega, passo per passo e in parole semplici, come far funzionare
**davvero** l'invio delle email della pagina "Registrati" usando **Brevo**.
Con Brevo basta verificare **un singolo indirizzo email** come mittente (con un codice
che ti arriva via email): **niente DNS, niente dominio da configurare**, e l'email
arriva a **chiunque** si iscriva — professore compreso.

Lo shop e tutto il resto funzionano già da soli, senza alcuna configurazione.

---

## COSA C'È NEL PACCHETTO

- **`index.html`** — la landing con il form per l'email (è la home del sito).
- **`shop.html`** — il finto e-commerce con le 7 action figure e il carrello.
- **`api/register.js`** — la "funzione serverless": riceve l'email dal form e la invia
  tramite Brevo. È l'unica parte che richiede un po' di configurazione (i passi qui sotto).
- **`vercel.json`** e le immagini in `assets/img/`.

---

## PERCHÉ SERVE UNA "FUNZIONE SERVERLESS"

La chiave segreta di Brevo (la API key) **non può** stare nelle pagine HTML, perché
chiunque visiti il sito potrebbe vederla. Quindi il form invia l'email digitata a
`/api/register`, e la funzione `api/register.js` — che gira **sul server** di Vercel,
dove la chiave è al sicuro — chiama Brevo. Vercel trasforma da solo il file
`api/register.js` nell'indirizzo `/api/register`: non devi configurare rotte.

---

## PASSO 1 — Crea un account Brevo

1. Vai su **https://www.brevo.com** e registrati (il piano gratuito basta: fino a
   **300 email al giorno**, più che sufficiente per test e presentazione).
2. Conferma il tuo account dall'email che ricevi.

---

## PASSO 2 — Verifica l'indirizzo MITTENTE (qui sta la comodità)

Questa è la parte che ti evita tutto il problema dei DNS. Verifichi una singola casella
email che farà da mittente. Consiglio: usa una Gmail dedicata al progetto, per esempio
`growup.agency.elystria@gmail.com` (credibile per l'agenzia fittizia). Va bene anche una
tua Gmail esistente.

1. Nel pannello Brevo vai su **Settings** (impostazioni) → **Senders, Domains & IPs**
   (Mittenti, Domini e IP) → scheda **Senders** (Mittenti).
2. Clicca **Add a sender** (Aggiungi un mittente).
3. Inserisci un **nome** (es. `Elystria`) e l'**email** mittente (es. la tua Gmail).
4. Salva. Brevo invia un'email a quell'indirizzo con un **codice a 6 cifre**.
5. Apri quella casella, copia il codice, incollalo su Brevo per **verificare** il mittente.
6. Quando il mittente risulta **verificato** ✅, è pronto all'uso.

> Da questo momento puoi inviare a CHIUNQUE (non solo a te). È la differenza rispetto
> all'indirizzo di test di altri servizi.

---

## PASSO 3 — Crea la API key di Brevo

1. Nel pannello Brevo vai su **Settings** → **SMTP & API** → scheda **API Keys**.
2. Clicca **Generate a new API key** (Genera una nuova API key), dai un nome (es.
   `elystria`) e crea.
3. Copia la chiave e **tienila da parte**: la incollerai su Vercel al Passo 4.
   Non metterla mai nel codice né su GitHub.

> ⚠️ ATTENZIONE — errore comune: serve la **API key** (sezione "API Keys"),
> NON la "SMTP key". Sono due credenziali diverse. La nostra funzione usa la **API key**.

---

## PASSO 4 — Imposta le variabili su Vercel

> Questo si fa **dopo** aver caricato il sito su GitHub e collegato a Vercel.

1. Su **vercel.com**, apri il tuo progetto.
2. **Settings** → **Environment Variables**.
3. Aggiungi la PRIMA variabile (la chiave Brevo):
   - **Name:** `BREVO_API_KEY`
   - **Value:** la API key copiata al Passo 3
   - Lascia selezionati tutti gli ambienti (Production, Preview, Development). **Save**.
4. Aggiungi la SECONDA variabile (il mittente verificato al Passo 2):
   - **Name:** `MAIL_FROM`
   - **Value:** `Elystria <growup.agency.elystria@gmail.com>`
     (metti la TUA email verificata; il formato "Nome <email>" è corretto)
   - **Save**.
5. (Facoltativo, comodo per la demo) TERZA variabile per far partire il contatore
   "vicino al 50" e mostrare entrambi gli esiti con poche iscrizioni:
   - **Name:** `START_COUNT`
   - **Value:** `49`  (così la 1ª e 2ª iscrizione "vincono", dalla 3ª arrivano i livelli)
   - **Save**.  Per una demo normale, ometti questa variabile (parte da 0).
6. **Importante:** dopo aver aggiunto/modificato le variabili, vai su **Deployments**
   e fai un **Redeploy** dell'ultimo deployment (le variabili valgono solo dopo un nuovo deploy).

---

## PASSO 5 — Prova dal vivo

1. Apri il sito pubblicato → pagina **Registrati** (la home).
2. Inserisci un'email qualsiasi (anche diversa dalla tua) → **Iscrivimi**.
3. Vedrai il messaggio di esito sulla pagina e, dopo pochi secondi, l'email nella casella.
4. Su Brevo, in **Transactional → Logs/Statistics**, vedi lo storico degli invii.

> 📩 Le prime email possono finire in **SPAM/Posta indesiderata**. Se il messaggio in
> pagina dice "successo" ma non vedi l'email, controlla lo spam prima di tutto.

---

## COME FUNZIONA IL "PRIMI 50" (per la presentazione)

Niente database: il conteggio è **fittizio**, in memoria sul server.

- Parte da `START_COUNT` (default 0) e sale di 1 a ogni **nuova** iscrizione riuscita.
- Iscritti fino al n° **50** → email "**hai vinto l'action figure di Zython**".
- Dal **51° in poi** → email "**hai vinto i primi 3 livelli gratis**".
- **Anti-doppione:** se la stessa email si reiscrive, non viene contata di nuovo e
  riceve lo stesso esito di prima (i numeri non si sballano se qualcuno clicca due volte).
- Per cambiare la soglia: in `api/register.js`, in cima, modifica `SOGLIA_VINCITORI = 50`.

### Trucco per la demo: contatore vicino al 50
Imposta `START_COUNT` a `49` (Passo 4): la 1ª iscrizione sarà la n° 50 (vince), la 2ª la
n° 51 (riceve i 3 livelli). In due iscrizioni mostri **entrambi** gli esiti. A demo finita,
puoi togliere `START_COUNT`.

⚠️ Su Vercel le funzioni possono "addormentarsi": al risveglio il contatore riparte da
`START_COUNT`. Per una presentazione non è un problema (anzi, con `START_COUNT` impostato
riparte sempre pronto). Consiglio: fai le iscrizioni di prova una di seguito all'altra.

---

## SE QUALCOSA NON VA

Controlla su Vercel i **Logs** della funzione (Deployments → la tua build → Functions/Logs),
poi rifai un'iscrizione per vedere l'errore in tempo reale. Cerca una riga `Brevo error:`.
- `missing_api_key` = non hai messo `BREVO_API_KEY` (o non hai fatto il Redeploy dopo).
- `sender_not_verified` (in pagina) o un `Brevo error: ...sender...` nei log = il mittente
  in `MAIL_FROM` non è ancora verificato su Brevo, oppure non coincide esattamente con
  l'indirizzo verificato al Passo 2. Verifica/correggi e rifai il Redeploy.
- Hai usato per sbaglio la **SMTP key** invece della **API key**? Rigenera la API key
  giusta (Passo 3) e aggiornala su Vercel.
- **In locale (doppio clic sul file) il form dà errore** → normale: `/api/register` esiste
  solo quando il sito è **su Vercel**. In locale vedi e mostri grafica, validazione e
  messaggi; l'invio vero si prova online.
- **Lo shop non invia niente** → corretto: è un negozio dimostrativo, nessun pagamento reale.

---

## RIEPILOGO VARIABILI SU VERCEL

```
BREVO_API_KEY = (la API key di Brevo, dalla sezione API Keys)
MAIL_FROM     = Elystria <la-tua-email-verificata@gmail.com>
START_COUNT   = 49        (facoltativa, solo per la demo)
```
