# MB Voyages · Landing page Omra

Site vitrine + formulaire de réservation (Vite, HTML, CSS, JavaScript).

## Lancer en local
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # génère le dossier dist/ à mettre en ligne
```

## À personnaliser
Dans `src/main.js`, objet `CONFIG` en haut du fichier :
- `whatsapp` : numéro WhatsApp de l'agence (format international, ex. 33612345678)
- `email`, `phoneDisplay` : coordonnées affichées
- `price` : prix public par personne (ex. 1590). Laisser `null` affiche « Tarif sur demande ».

## Réservation
Pas de serveur : le formulaire vérifie les champs puis ouvre WhatsApp (ou la messagerie)
avec la demande pré-remplie. L'agence reçoit le message et rappelle le client.

## Mise en ligne
Le dossier `dist/` est statique : Netlify (glisser-déposer), Vercel, GitHub Pages, OVH…
