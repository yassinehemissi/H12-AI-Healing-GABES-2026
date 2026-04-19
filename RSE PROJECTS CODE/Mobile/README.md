# Gabes Eco Mobile

Application mobile Expo dediee au backend `gabes_eco`.

## Ecrans disponibles

- `Accueil` : vue d'ensemble du backend et navigation.
- `Assistant` : point d'entree unique vers `/orchestrator/chat`.
- `Recyclage` : texte, image et categories.
- `Transparence` : analyse, dashboard, signalement.
- `Upcycling` : ideation manuelle et generation d'images.
- `Configuration` : URL backend partagee par toute l'app.

## Demarrage

```bash
npm install
npx expo start
```

## Configuration backend

L'app lit une URL backend par defaut depuis `app.json` :

- `expo.extra.apiBaseUrl`

Vous pouvez aussi la modifier dans l'ecran `Configuration`. L'URL est memorisee localement avec AsyncStorage.

## Conseils reseau

- En local sur telephone, utilisez l'IP reseau de votre machine, pas `localhost`.
- Avec Railway, mettez directement votre domaine public `https://...up.railway.app`.
