/* =========================================================
   db.js — Connexion à MongoDB (local via Docker ou MongoDB Atlas)
   ========================================================= */
const mongoose = require("mongoose");

const attendre = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connecterBD(tentatives = 10) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ La variable d'environnement MONGODB_URI est manquante.");
    process.exit(1);
  }

  for (let essai = 1; essai <= tentatives; essai++) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ MongoDB connecté (${mongoose.connection.host} / ${mongoose.connection.name})`);
      return;
    } catch (erreur) {
      console.error(`⏳ Connexion MongoDB impossible (essai ${essai}/${tentatives}) : ${erreur.message}`);
      if (essai === tentatives) process.exit(1);
      await attendre(3000); // le conteneur MongoDB peut mettre quelques secondes à démarrer
    }
  }
}

module.exports = connecterBD;
