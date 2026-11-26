/* Statistiques affichées sur l'accueil du dashboard */
const Produit = require("../models/Produit");
const Commande = require("../models/Commande");
const Article = require("../models/Article");
const Message = require("../models/Message");

// GET /api/stats
exports.obtenir = async (req, res) => {
  const [produits, commandes, articles, messagesNonLus, chiffreAffaires, parStatut, dernieresCommandes] =
    await Promise.all([
      Produit.countDocuments(),
      Commande.countDocuments(),
      Article.countDocuments(),
      Message.countDocuments({ lu: false }),
      Commande.aggregate([
        { $match: { statut: { $ne: "annulée" } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),
      Commande.aggregate([{ $group: { _id: "$statut", nombre: { $sum: 1 } } }]),
      Commande.find().sort({ createdAt: -1 }).limit(5)
    ]);

  res.json({
    produits,
    commandes,
    articles,
    messagesNonLus,
    chiffreAffaires: chiffreAffaires[0]?.total || 0,
    commandesParStatut: Object.fromEntries(parStatut.map((s) => [s._id, s.nombre])),
    dernieresCommandes
  });
};
