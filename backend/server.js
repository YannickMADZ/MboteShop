/* =========================================================
   server.js — Point d'entrée : connexion MongoDB puis démarrage
   ========================================================= */
// Lit le fichier .env s'il existe (fonction intégrée à Node.js 20.12+, sans dépendance).
// Avec Docker, les variables sont déjà fournies par docker-compose.yml / Render.
try { process.loadEnvFile(); } catch { /* pas de fichier .env : on utilise les variables existantes */ }

const app = require("./src/app");
const connecterBD = require("./src/config/db");
const { remplirSiVide } = require("./src/seed/seed");

const PORT = process.env.PORT || 3000;

async function demarrer() {
  await connecterBD();
  await remplirSiVide(); // insère les données de départ si la base est vide
  app.listen(PORT, () => {
    console.log(`✅ Serveur démarré : http://localhost:${PORT}`);
    console.log(`   Boutique   : http://localhost:${PORT}/`);
    console.log(`   Dashboard  : http://localhost:${PORT}/admin.html`);
    console.log(`   API        : http://localhost:${PORT}/api/produits`);
  });
}

demarrer();
