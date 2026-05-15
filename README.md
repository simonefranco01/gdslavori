# GDS Lavori — sito web

Versione pronta per **GitHub Pages** del sito statico di GDS Lavori.

## File principali

- `index.html` — Home
- `servizi.html` — Servizi
- `portfolio.html` — Portfolio
- `chi-siamo.html` — Chi siamo
- `faq.html` — FAQ
- `contatti.html` — Contatti
- `preventivo.html` — Richiesta preventivo
- `styles.css` — Stili grafici
- `script.js` — Interazioni JavaScript
- `assets/` — Logo e immagini

## Pubblicazione su GitHub Pages

Caricare **il contenuto di questa cartella**, non la cartella intera, nella root del repository GitHub.

La root del repository deve mostrare subito:

```text
index.html
servizi.html
portfolio.html
chi-siamo.html
faq.html
contatti.html
preventivo.html
styles.css
script.js
assets/
```

Poi andare su:

```text
Settings → Pages → Source: Deploy from a branch → Branch: main → Folder: / root → Save
```

Il sito temporaneo sarà visibile su:

```text
https://simonefranco01.github.io/gdslavori-site/
```

## Nota importante sul modulo preventivo

Questa versione era nata anche con impostazioni Netlify Forms. Su GitHub Pages il form non invia email automaticamente, perché GitHub Pages ospita solo file statici. Per far funzionare davvero il modulo bisogna collegarlo a un servizio esterno, per esempio Formspree, oppure pubblicare il sito su Netlify.

## Modifiche fatte per GitHub Pages

- Link della Home corretto da `/` a `index.html`.
- Azione del form corretta da `/grazie.html` a `grazie.html`.
- Rimossi dal pacchetto i file tecnici non necessari per GitHub Pages: `design_handoff_gds_lavori/`, `uploads/`, `netlify.toml`.
