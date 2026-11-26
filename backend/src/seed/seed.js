/* =========================================================
   seed.js — Remplit la base avec les données de départ
   - au démarrage du serveur : seulement si la base est vide
   - en ligne de commande : npm run seed  (ou npm run seed:reset pour tout effacer avant)
   ========================================================= */
const Produit = require("../models/Produit");
const Article = require("../models/Article");
const donnees = require("./donnees");

async function remplirSiVide() {
  if ((await Produit.countDocuments()) === 0) {
    await Produit.insertMany(donnees.produits);
    console.log(`🌱 ${donnees.produits.length} produits ajoutés.`);
  }
  if ((await Article.countDocuments()) === 0) {
    await Article.insertMany(donnees.articles);
    console.log(`🌱 ${donnees.articles.length} articles ajoutés.`);
  }
  await remplacerAnciennesIllustrations();
}

/* Mise à jour des bases créées avec l'ancienne version (illustrations .svg) :
   on remplace l'image par la photo, uniquement pour les produits/articles de départ
   dont l'image est encore une ancienne illustration. Les images modifiées
   depuis le dashboard ne sont jamais touchées. */
async function remplacerAnciennesIllustrations() {
  const ancienneIllustration = { $regex: "^images/(?!placeholder).*\\.svg$" };
  let total = 0;
  for (const p of donnees.produits) {
    const r = await Produit.updateOne({ nom: p.nom, image: ancienneIllustration }, { image: p.image });
    total += r.modifiedCount || 0;
  }
  for (const a of donnees.articles) {
    const r = await Article.updateOne({ titre: a.titre, image: ancienneIllustration }, { image: a.image });
    total += r.modifiedCount || 0;
  }
  if (total) console.log(`🖼️  ${total} illustration(s) remplacée(s) par des photos.`);
}

module.exports = { remplirSiVide };

// Exécution directe : node src/seed/seed.js [--reset]
if (require.main === module) {
  try { process.loadEnvFile(); } catch { /* pas de .env */ }
  const mongoose = require("mongoose");
  const connecterBD = require("../config/db");

  (async () => {
    await connecterBD(3);
    if (process.argv.includes("--reset")) {
      await Promise.all([Produit.deleteMany({}), Article.deleteMany({})]);
      console.log("🧹 Produits et articles supprimés.");
    }
    await remplirSiVide();
    console.log("✅ Seed terminé.");
    await mongoose.disconnect();
  })();
}
