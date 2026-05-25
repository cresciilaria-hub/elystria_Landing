# BRIEFING PROGETTO ELYSTRIA — da incollare nella nuova chat

> Copia e incolla questo intero documento come PRIMO messaggio nella nuova chat
> del progetto. Allega anche la cartella `elystria_sito` (o i file principali).
> Servirà a Claude per riprendere il lavoro esattamente da dove eravamo.

---

## COSA STIAMO FACENDO
Sito web multi-pagina per il videogioco fantasy **"Elystria – La Fiamma Primordiale"**.
È un progetto scolastico (agenzia fittizia "GrowUp Agency"), serve da supporto alla
presentazione orale davanti alla commissione. Team: **Ilaria, Martina, Jolanda**.
Lingua del sito: italiano + inglese (selettore IT/EN). Destinazione finale: **Vercel**.
Io (l'utente) sono alle prime armi: vanno bene istruzioni semplici e concrete.

## STILE GRAFICO APPROVATO (usare IDENTICO su tutte le pagine)
- Font: **Cinzel** (titoli) + **Cormorant Garamond** (corpo), via Google Fonts.
- Palette oro-su-nero. CSS variables:
  --nero:#0a0810; --oro:#e6c068; --oro-chiaro:#f8e4b0; --oro-scuro:#9c7a32;
  --fiamma:#ffce4d; --testo:#f0ead8; --testo-soft:#c4baa4; --bordo:rgba(230,192,104,0.25)
- Mood: fantasy/epico, luminoso-eroico. Animazioni all'apparire (reveal on scroll),
  parallasse, scintille dorate (embers).
- Menu fisso in alto IDENTICO su ogni pagina:
  Home · Il Team · Il Progetto · Storia · Il Gioco ▾ (Personaggi, I Regni, Meccaniche, Galleria) · Timeline · [IT|EN]
  Su mobile: hamburger ☰.
- Multilingua: ogni elemento di testo ha attributi `data-it` e `data-en`; funzione JS
  `setLang(lang)` che usa innerHTML. La voce di menu attiva ha classe `active`.
- Footer su ogni pagina: scuola, classe, anno scolastico + "Progetto realizzato da Ilaria, Martina e Jolanda".

## STRUTTURA SITO (8 pagine + galleria) — ordine narrativo
1. Home (index.html) ........... FATTA ✅
2. Il Team (team.html) ......... DA FARE — Ilaria, Martina, Jolanda in 3 carte
3. Il Progetto (progetto.html) . DA FARE — include il TESTO INGLESE UFFICIALE integrale (vedi sotto)
4. Storia (storia.html) ........ FATTA ✅ (5 capitoli, approvata)
5. Personaggi (personaggi.html)  DA FARE — griglia, click → POPUP scheda. Theron, Ophelia, Zython + 4 Dei (forma sana/corrotta)
6. I Regni (regni.html) ........ DA FARE — 4 aree: Tempio Sommerso/Adoria(Acqua), Vulcano del Cuore Fuso/Firyon(Fuoco), Foresta Distorta/Gairok(Terra), Santuario Sospeso/Neraya(Aria)
7. Meccaniche (meccaniche.html)  DA FARE — Metroidvania/Souls-like, Sinergie elementali, Vigore, arsenale, rune
8. Timeline (timeline.html) .... DA FARE — 10 fasi su linea VERTICALE, click → POPUP
+ Galleria (galleria.html) ..... DA FARE

## PROSSIMO PASSO IMMEDIATO
Costruire la pagina **Personaggi** (era il prossimo punto concordato), poi a seguire:
I Regni → Meccaniche → Il Team → Il Progetto → Timeline → Galleria.

## REGOLE OPERATIVE IMPORTANTI (decise insieme)
- **Immagini**: le pagine usano riferimenti tipo `assets/img/nome.jpg`. NON usare base64
  nel pacchetto finale (Vercel vuole file separati). Le immagini sono già su disco/Drive.
- **Ritagli immagini**: per immagini ORIZZONTALI usare classe `wide` (aspect-ratio 3/2,
  object-position center 38%); per VERTICALI/personaggi usare classe `portrait`
  (object-position center 22%). Questo risolve i ritagli storti.
- **Theron narrativo**: NON usare il model-sheet con 3 viste. Usare `theron3.jpg`
  (vista frontale singola del guerriero in armatura, già ritagliata e su disco/Drive come SITO_theron3.jpg).
- **Dei mancanti** (Adoria/Firyon/Neraya forme sana/corrotta): se non disponibili come file,
  mettere SEGNAPOSTO elegante + annotare nel foglio istruzioni quale file Drive usare.
- **Trailer**: per ora placeholder YouTube. L'utente caricherà il vero trailer su YouTube più avanti.
  (Il video .mov da 260MB su Drive NON va usato: troppo pesante.)
- **Metodo download Drive**: le immagini piccole arrivano inline come base64 (ingombrante).
  Meglio: costruire le pagine con i nomi-file giusti e dare all'utente un FOGLIO ISTRUZIONI
  finale che dice quale immagine Drive mettere in quale percorso. L'utente ha già tutto sul PC.

## DATI ANCORA DA CHIEDERE ALL'UTENTE
- Nome scuola, classe, anno scolastico (per il footer)
- Ruoli specifici di Ilaria, Martina, Jolanda (per la pagina Team)

## TESTO INGLESE UFFICIALE (pagina "Il Progetto" — riportare INTEGRALE, senza modifiche)
"Our game is called Elystria. It is a fantasy game inspired by and based on the concept of
Greek gods. There are five main deities based on natural elements. The objective is to defeat
the corrupt version of each god and free their good counterpart. The game is set in an open
world, featuring different scenarios tailored to each god's unique character. The player
controls Theron in a first-person perspective; they must free the gods, defeat Zyton, and rid
Elystria of the evil influence. This game is particularly interesting and special because...
Transforming our original ideas and lore into a fully realized 3D fantasy project, and seeing
characters like Theron and Zyton come to life, makes this journey incredibly rewarding and unique."
(NOTA: c'è un'incoerenza "first-person" nel testo EN vs Metroidvania 3D terza persona del GDD.
Da risolvere col professore. Claude lascia il testo EN intatto.)

## LORE (per Personaggi/Regni/Timeline)
- Era Armonia: Elystria sostenuta dalla Fiamma Primordiale, 5 frammenti custoditi da 5 Dei.
- Caduta: il Titano **Zython** (Primo Divoratore: idra + corpo draconico + tentacoli d'ombra,
  boss finale) sopraffà 4 Dei e li imprigiona in corpi mostruosi corrotti.
- **Ophelia**: Dea della Saggezza, custode ultimo frammento, spirito etereo, mentore di Theron.
- **Theron**: il Prediletto, nato da Dio + mortale, ha la Risonanza Divina (assorbe i poteri
  degli Dei liberati), immune alla corruzione, brandisce la Fiamma.
- I 4 Dei (forma sana → corrotta → arena):
  - Adoria (Acqua) → Necrosirena → Tempio Sommerso
  - Firyon (Fuoco) → Colosso di lava → Vulcano del Cuore Fuso
  - Gairok (Terra) → Mostro-Albero → Foresta Distorta
  - Neraya (Aria) → Spirito Eterico → Santuario Sospeso
- Meccaniche: Metroidvania 3D + Souls-like (Santuari di Ophelia: ripristinano Salute/Vigore
  ma respawnano i nemici). Sinergie: Acqua+Vento=Tempesta Cinetica, Terra+Fuoco=Eruzione Vulcanica.
  Arsenale: Spada della Fiamma, lance/asce/archi, Frammenti d'Essenza, Rune di Sinergia.
- Visione estetica: cinematic UE5, contrasto viola (corruzione) / oro (luce).

## LE 10 FASI DEL PROGETTO (per la Timeline)
1. World-building / narrativa
2. GDD / testi di gioco
3. Generazione personaggi (Midjourney)
4. Concept ambientali / prigioni
5. Animazione asset 2D
6. Montaggio Teaser Trailer (Premiere)
7. Sound design
8. Modellazione 3D mesh + stampa fisica (Meshy / STL)
9. Sito promozionale + HUD React
10. Brochure cartacea con QR Code

## IMMAGINI DISPONIBILI (già su disco, nella cartella assets/img del pacchetto)
keyart.jpg (poster con tutti i personaggi + logo), ophelia_theron.jpg (sfondo hero Home),
ophelia.jpg, zython.jpg, gairok.jpg, theron3.jpg (Theron guerriero singolo per la narrazione),
theron.jpg + theron_armatura.jpg (model-sheet, NON per narrazione), azione.jpg (scena di combattimento),
spade.jpg, e le ambientazioni: amb_tempio.jpg/amb_tempio2.jpg (acqua), amb_vulcano.jpg/amb_vulcano2.jpg (fuoco),
amb_foresta.jpg/amb_foresta2.jpg (terra), amb_santuario.jpg/amb_santuario2.jpg (aria).
Logo: assets/logo.png.
MANCANO ritratti puliti dei 4 Dei nelle forme sana/corrotta → usare segnaposto + istruzioni.

## GOOGLE DRIVE (account cremiki@gmail.com)
Cartella "Elystria" annidata. Documenti chiave:
- introduzione in inglese ELYSTRIA.docx, giuda alla presentazione.pdf (le 10 fasi),
  La-Fiamma-Primordiale.pdf (lore completa).
- Immagini in /generazioni/foto/ con sottocartelle: personaggi, "foto Divise" (jpeg leggeri
  per angolazione), ambientazioni sane, ambientazioni corrotte, copertina, spade.
- Theron_3 salvato nella radice del Drive come SITO_theron3.jpg.
