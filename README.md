# converter

Application web simple de conversion d'une devise vers une autre.

- Choix de la devise des deux côtés (avec bouton d'inversion).
- Taux vérifiés en ligne à chaque changement (taux de référence BCE via l'API Frankfurter, avec API de secours ExchangeRate-API).
- Par défaut : conversion d'une devise étrangère (USD) vers l'euro (EUR).

## Utilisation

Ouvrir `index.html` dans un navigateur, ou servir le dossier statiquement :

```
python3 -m http.server
```

## Fichiers

- `index.html` — page du convertisseur
- `style.css` — mise en page
- `app.js` — logique de conversion et appels API
- `test.mjs` — test de bout en bout en Node (`node test.mjs`)
