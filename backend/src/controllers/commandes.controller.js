/* Gestion des commandes */
const mongoose = require("mongoose");
const Commande = require("../models/Commande");
const Produit = require("../models/Produit");
const { calculerTotaux } = require("../utils/tarifs");
const { ErreurApi, choisirChamps } = require("../utils/outils");

// GET /api/commandes?statut=en attente
exports.lister = async (req, res) => {
  const filtre = req.query.statut ? { statut: req.query.statut } : {};
  const commandes = await Commande.find(filtre).sort({ createdAt: -1 });
  res.json(commandes);
};

// GET /api/commandes/:id
exports.obtenir = async (req, res) => {
  const commande = await Commande.findById(req.params.id);
  if (!commande) return res.status(404).json({ message: "Commande introuvable." });
  res.json(commande);
};

// POST /api/commandes  (appelé par la page panier du frontend)
// Corps attendu : { client: {...}, paiement, codePromo, lignes: [{ produit: "id", quantite: 2 }] }
exports.creer = async (req, res) => {
  const { client = {}, paiement, codePromo, lignes } = req.body || {};

  if (!Array.isArray(lignes) || lignes.length === 0) {
    throw new ErreurApi(400, "Le panier est vide.");
  }

  const ids = lignes.map((ligne) => ligne.produit);
  if (!ids.every((id) => mongoose.isValidObjectId(id))) {
    throw new ErreurApi(400, "Un des produits du panier est invalide.");
  }

  // On récupère les VRAIS prix depuis la base de données
  const produits = await Produit.find({ _id: { $in: ids } });

  const lignesCommande = lignes.map((ligne) => {
    const produit = produits.find((p) => p.id === String(ligne.produit));
    if (!produit) throw new ErreurApi(400, "Un produit du panier n'existe plus. Veuillez actualiser votre panier.");

    const quantite = Number.parseInt(ligne.quantite, 10);
    if (!(quantite >= 1 && quantite <= 100)) throw new ErreurApi(400, `Quantité invalide pour ${produit.nom}.`);

    return {
      produit: produit._id,
      nom: produit.nom,
      prix: produit.prix,
      quantite: quantite,
      total: produit.prix * quantite
    };
  });

  const totaux = calculerTotaux(lignesCommande, codePromo, client.ville);

  const commande = await Commande.create({
    client: choisirChamps(client, ["nom", "telephone", "adresse", "ville"]),
    paiement,
    lignes: lignesCommande,
    ...totaux
  });

  res.status(201).json(commande);
};

// PUT /api/commandes/:id  (dashboard : changer le statut)
exports.modifier = async (req, res) => {
  const commande = await Commande.findByIdAndUpdate(req.params.id, choisirChamps(req.body, ["statut"]), {
    new: true,
    runValidators: true
  });
  if (!commande) return res.status(404).json({ message: "Commande introuvable." });
  res.json(commande);
};

// DELETE /api/commandes/:id
exports.supprimer = async (req, res) => {
  const commande = await Commande.findByIdAndDelete(req.params.id);
  if (!commande) return res.status(404).json({ message: "Commande introuvable." });
  res.json({ message: "Commande supprimée.", id: commande.id });
};
