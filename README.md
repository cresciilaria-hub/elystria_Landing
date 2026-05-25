# Elystria — La Fiamma Primordiale

Sito web promozionale per il videogioco fantasy **Elystria – La Fiamma Primordiale**,
progetto scolastico realizzato da Ilaria, Martina e Jolanda (GrowUp Agency).

## Stato del sito
- [x] Home (`index.html`) — hero con parallasse, intro, trailer, footer
- [x] Storia (`storia.html`) — lore completa in 5 capitoli
- [x] Il Team (`team.html`) — 3 carte con ruoli segnaposto modificabili
- [x] Il Progetto (`progetto.html`) — testo EN ufficiale + sintesi IT
- [x] Personaggi (`personaggi.html`) — griglia + popup scheda (3 protagonisti + 4 Dei)
- [x] I Regni (`regni.html`) — comparatore slider sana→corrotta per i 4 Regni
- [x] Meccaniche (`meccaniche.html`) — gameplay, Vigore, Santuari, Sinergie, Arsenale
- [x] Timeline (`timeline.html`) — 10 fasi su linea verticale + popup
- [x] Galleria (`galleria.html`) — griglia masonry + filtri + lightbox

## Struttura
- File `.html` nella radice
- Immagini in `assets/img/`
- Logo in `assets/logo.png`

## Multilingua
Ogni testo ha attributi `data-it` e `data-en`. Il selettore IT/EN nel menu cambia lingua via JavaScript.

## Deploy su Vercel
1. Carica questa cartella su un repository GitHub
2. Su vercel.com: "Add New Project" → importa il repo
3. Framework preset: **Other** (sito statico, nessuna build necessaria)
4. Deploy

In alternativa, drag-and-drop della cartella su vercel.com.
