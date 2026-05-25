# FOGLIO ISTRUZIONI — Landing, Email (Resend) e Shop

Questo foglio spiega, passo per passo e in parole semplici, come far funzionare
**davvero** l'invio delle email della pagina "Registrati", una volta che il sito
è online su Vercel. Lo shop e tutto il resto funzionano già da soli, senza configurazione.

---

## COSA C'È DI NUOVO NEL SITO

Tre cose nuove sono state aggiunte al pacchetto:

1. **`index.html (la landing)`** — la landing con il form per l'email. Mostra le due ricompense
   (primi 50 → action figure di Zython; tutti gli altri → 3 livelli gratis), valida l'email,
   mostra il caricamento, e alla fine mostra il messaggio di esito giusto.

2. **`shop.html`** — il finto e-commerce con le 7 action figure (i 3 protagonisti + i 4 Dèi).
   Ha carrello completo (aggiungi, togli, cambia quantità, totale), filtri, e un finto checkout.
   **Funziona già tutto**, non serve configurare niente.

3. **`api/register.js`** — la "funzione serverless": è il piccolo programma che gira sul
   server di Vercel, riceve l'email dal form e invia l'email vera tramite Resend.
   👉 È l'unica parte che richiede un po' di configurazione (i passi qui sotto).

Le voci **"Registrati"** e **"Shop"** sono state aggiunte al menu di **tutte** le pagine.

---

## PERCHÉ SERVE UNA "FUNZIONE SERVERLESS"

La chiave segreta di Resend (la `API key`) **non può** stare nel codice delle pagine HTML,
perché chiunque visiti il sito potrebbe vederla e usarla. Quindi:

- Il form (in `index.html (la landing)`) invia l'email digitata a `/api/register`.
- La funzione `api/register.js` gira **sul server** (dove la chiave è al sicuro) e chiama Resend.
- Vercel trasforma automaticamente il file `api/register.js` nell'indirizzo `/api/register`.
  Non devi configurare rotte: basta che il file stia nella cartella `api/`.

---

## PASSO 1 — Crea un account Resend e una API key

1. Vai su **https://resend.com** e registrati (è gratuito per i test).
2. Conferma la tua email.
3. Nel pannello, vai su **API Keys** → **Create API Key**.
4. Dai un nome (es. `elystria`), lascia i permessi di default, e **crea**.
5. Copia la chiave (inizia con `re_...`). **Tienila da parte**: la incollerai su Vercel
   al Passo 3. Non metterla mai nel codice né su GitHub.

---

## PASSO 2 — Verifica il tuo dominio su Resend (mittente)

Hai scelto di usare **un dominio tuo** (es. `elystria.it`) come mittente. È la strada più
"professionale" e permette di inviare l'email a **chiunque** (non solo a te stesso).
È anche il passaggio dove ci si blocca più spesso, quindi seguilo con calma.

1. Su Resend → **Domains** → **Add Domain**.
2. Scrivi il tuo dominio (es. `elystria.it`) e conferma.
3. Resend ti mostra alcuni **record DNS** (di tipo TXT/MX, per SPF e DKIM).
   Questi vanno copiati nel pannello di chi ti gestisce il dominio (es. Aruba, GoDaddy,
   Namecheap, Cloudflare…), nella sezione "DNS" / "Gestione DNS".
   - Per ogni record: copia **Nome/Host**, **Tipo** e **Valore** esattamente come li dà Resend.
4. Torna su Resend e clicca **Verify**. La verifica può richiedere da pochi minuti
   a qualche ora (dipende dal provider del dominio).
5. Quando lo stato diventa **Verified** ✅, sei pronto. Il mittente sarà un indirizzo
   del tuo dominio, ad esempio `noreply@elystria.it` (non serve che la casella esista
   davvero: basta che il dominio sia verificato).

> ⏳ **Consiglio:** fai questo passo **qualche giorno prima** della presentazione, non
> all'ultimo, perché la propagazione DNS a volte è lenta. Una volta verificato, resta tale.

> 🔁 **Piano B di emergenza:** se il giorno della presentazione il dominio non risultasse
> ancora verificato, il codice ripiega in automatico sull'indirizzo di test di Resend
> (`onboarding@resend.dev`). Con quello, però, l'email arriva **solo all'indirizzo del tuo
> account Resend**: quindi, in quel caso, in pagina iscrivi quella stessa email e funzionerà.

---

## PASSO 3 — Metti la chiave su Vercel (variabile d'ambiente)

> Questo si fa **dopo** aver caricato il sito su GitHub e collegato a Vercel
> (vedi `ISTRUZIONI_GIT.md`, passi 1–5).

1. Su **vercel.com**, apri il tuo progetto Elystria.
2. **Settings** → **Environment Variables**.
3. Aggiungi la PRIMA variabile (la chiave Resend):
   - **Name:** `RESEND_API_KEY`
   - **Value:** la chiave `re_...` copiata al Passo 1
   - Lascia selezionati tutti gli ambienti (Production, Preview, Development).
   - **Save**.
4. Aggiungi la SECONDA variabile (il mittente del tuo dominio):
   - **Name:** `MAIL_FROM`
   - **Value:** `Elystria <noreply@iltuodominio.it>` (usa il dominio verificato al Passo 2)
   - **Save**.
5. (Facoltativo, comodo per la demo) Aggiungi una TERZA variabile per far partire il
   contatore "vicino al 50", così mostri entrambi gli esiti con poche iscrizioni:
   - **Name:** `START_COUNT`
   - **Value:** `48`  (le iscrizioni n° 49 e 50 vinceranno la figure, dalla 51ª i livelli gratis)
   - **Save**.  Per una demo normale, ometti questa variabile (parte da 0).
6. **Importante:** dopo aver aggiunto/modificato le variabili, vai su **Deployments**
   e fai un **Redeploy** dell'ultimo deployment (le variabili nuove valgono solo dopo un
   nuovo deploy).

---

## PASSO 4 — Prova dal vivo

1. Apri il sito pubblicato → pagina **Registrati**.
2. Inserisci un'email (con la Strada A: la tua email di Resend) → **Iscrivimi**.
3. Vedrai il messaggio di esito sulla pagina e, dopo pochi secondi, l'email nella casella.
4. Su Resend, nella sezione **Emails/Logs**, vedi anche lo storico degli invii.

---

## COME FUNZIONA IL "PRIMI 50" (importante per la presentazione)

Come deciso, **non c'è un database**: il conteggio è **fittizio**, fatto in memoria dal server.
Ho scelto la versione più solida per una presentazione dal vivo, con due accorgimenti.

- Il server tiene un numero che parte da `START_COUNT` (di default 0) e sale di 1 a ogni
  **nuova** iscrizione andata a buon fine.
- Iscritti fino al n° **50** → email "**hai vinto l'action figure di Zython**".
- Dal **51° in poi** → email "**hai vinto i primi 3 livelli gratis**".
- **Anti-doppione:** se la stessa email si reiscrive, **non** viene contata di nuovo; le viene
  rimandato lo stesso esito di prima. Così i numeri non si sballano se qualcuno clicca due volte.
- Vuoi cambiare la soglia? In `api/register.js`, in cima, modifica `SOGLIA_VINCITORI = 50`.

### Trucco per la demo: far partire il contatore vicino al 50
Fare 50 iscrizioni vere davanti al prof è scomodo. Imposta su Vercel la variabile
`START_COUNT` a `48` (vedi Passo 3): così la **prima** iscrizione sarà la n° 49 (vince la
figure), la **seconda** la n° 50 (vince), la **terza** la n° 51 (riceve i 3 livelli gratis).
In tre iscrizioni mostri **entrambi** gli esiti. Finita la demo, puoi rimuovere `START_COUNT`.

⚠️ **Cosa sapere:** su Vercel le funzioni serverless possono "addormentarsi" quando non
vengono usate, e al risveglio il contatore **riparte da `START_COUNT`**. Per una presentazione
non è un problema (anzi, con `START_COUNT=48` riparte sempre pronto a mostrare i due esiti).
Consiglio pratico: fai le iscrizioni di prova **una di seguito all'altra**.
(Se un giorno ti servisse un conteggio "vero" e permanente, si aggiunge un piccolo database
tipo Vercel KV — ma per ora **non serve** e l'abbiamo volutamente evitato.)

---

## SE QUALCOSA NON VA

- **Non arriva nessuna email, e in pagina compare un errore** → controlla su Vercel
  i **Logs** della funzione (Deployments → la tua build → Functions/Logs).
  - `missing_api_key` = non hai messo `RESEND_API_KEY` (o non hai fatto il Redeploy dopo).
  - `email_failed` = di solito il mittente. Verifica che il dominio su Resend sia **Verified**
    e che `MAIL_FROM` usi un indirizzo di quel dominio (es. `noreply@iltuodominio.it`).
    Se stai usando il ripiego `onboarding@resend.dev`, ricorda che invia solo alla tua
    email dell'account Resend.
- **In locale (aprendo il file col doppio clic) il form dà errore** → è normale:
  `/api/register` esiste solo quando il sito è **su Vercel**. In locale puoi comunque vedere
  e mostrare tutta la grafica, la validazione e i messaggi; l'invio vero si prova online.
- **Lo shop non invia niente** → corretto: è un negozio dimostrativo, nessun pagamento reale.

---

## FILE TOCCATI / AGGIUNTI IN QUESTA FASE

```
index.html (la landing)      (NUOVO)  landing + form email
shop.html            (NUOVO)  finto e-commerce con carrello
api/register.js      (NUOVO)  funzione serverless che invia l'email via Resend
index.html ... galleria.html  (modificati: aggiunte voci menu "Registrati" e "Shop")
```

Tutto il resto del sito è rimasto identico.
