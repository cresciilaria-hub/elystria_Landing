# Come salvare il sito su Git/GitHub

Questi sono i comandi da eseguire **sul tuo computer** (nel terminale / Prompt dei comandi),
dopo aver scaricato e scompattato la cartella `elystria_sito`.

## 1. Prerequisito
Installa Git se non ce l'hai: https://git-scm.com/downloads
Crea un account su https://github.com (gratuito).

## 2. Crea il repository su GitHub
- Vai su github.com → pulsante verde "New" (nuovo repository)
- Nome: `elystria-sito` (o quello che preferisci)
- Lascialo **Public** o **Private** a tua scelta
- NON aggiungere README/gitignore (li abbiamo già)
- Clicca "Create repository"
- Copia l'URL che ti mostra (es: https://github.com/TUONOME/elystria-sito.git)

## 3. Comandi da eseguire nella cartella del sito
Apri il terminale DENTRO la cartella `elystria_sito`, poi incolla questi comandi
(sostituisci l'URL con quello del TUO repository):

```
git init
git add .
git commit -m "Sito Elystria: Home e Storia complete"
git branch -M main
git remote add origin https://github.com/TUONOME/elystria-sito.git
git push -u origin main
```

## 4. Salvataggi successivi
Ogni volta che aggiungi/modifichi pagine, ripeti solo:

```
git add .
git commit -m "descrizione di cosa hai cambiato"
git push
```

## 5. Deploy su Vercel (quando vuoi pubblicare)
- Vai su vercel.com, accedi con GitHub
- "Add New Project" → seleziona il repo `elystria-sito`
- Framework Preset: **Other**
- Clicca Deploy. Avrai un link pubblico tipo `elystria-sito.vercel.app`
