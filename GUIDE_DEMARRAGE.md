# Fusion IA — Guide de démarrage (À lire en premier)

Cette application pose ta question à Claude, GPT et Gemini en même temps, puis fusionne les trois réponses en une seule. Voici comment la faire fonctionner, étape par étape.

## 1. Récupérer les clés API (à faire une seule fois)

Tu as besoin d'une clé pour chacun des 3 services. Chacun nécessite un compte développeur (souvent gratuit à la création, avec un petit crédit offert) :

- **Anthropic (Claude)** : console.anthropic.com → section "API Keys"
- **OpenAI (GPT)** : platform.openai.com → section "API Keys"
- **Google (Gemini)** : aistudio.google.com → "Get API Key"

Garde ces 3 clés de côté, tu vas les coller dans un fichier juste après.

## 2. Installer le backend (le serveur)

Ouvre un terminal dans le dossier `backend/` et tape :

```
npm install
```

Cela télécharge les outils nécessaires (ça peut prendre une minute).

Ensuite, crée ton fichier de configuration :

```
cp .env.example .env
```

Ouvre le fichier `.env` créé et remplace les textes par tes vraies clés API récupérées à l'étape 1.

## 3. Lancer le backend

Toujours dans le dossier `backend/` :

```
npm start
```

Si tout va bien, tu verras : `Serveur Fusion IA démarré sur http://localhost:3001`

Laisse cette fenêtre de terminal ouverte — c'est ton serveur qui tourne.

## 4. Lancer le frontend (l'interface)

Le dossier `frontend/` contient juste des fichiers web simples. Le plus simple pour tester en local : ouvre le fichier `index.html` directement dans ton navigateur (double-clic dessus), ou utilise une extension comme "Live Server" si tu as VS Code installé.

## 5. Tester

Tape une question, clique sur "Demander". L'application va interroger les 3 IA et t'afficher la réponse fusionnée après quelques secondes.

## Et après ? (mise en ligne)

Une fois que ça fonctionne sur ton ordinateur, l'étape suivante est de déployer :
- Le **backend** sur un service comme Render ou Railway (gratuit pour démarrer)
- Le **frontend** sur Vercel ou Netlify (gratuit, très simple)

Dis-moi quand tu es prêt pour cette étape, je te guiderai dans le déploiement précis avec les bonnes configurations.

## En cas de problème

- "Erreur Claude / GPT / Gemini" dans le terminal → vérifie que la clé API correspondante dans `.env` est correcte et active
- Le frontend affiche une erreur de connexion → vérifie que le backend est bien lancé (étape 3) et que l'adresse dans `script.js` correspond bien à `http://localhost:3001`
- Coûts : chaque question fait 4 appels API au total (3 IA + 1 fusion), donc surveille ta consommation sur chaque plateforme, surtout au début
