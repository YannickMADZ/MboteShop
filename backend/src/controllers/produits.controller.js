/* CRUD des produits */
const Produit = require("../models/Produit");
const { choisirChamps, echapperRegex } = require("../utils/outils");

const CHAMPS = ["nom", "prix", "categorie", "image", "description", "vedette"];

const TRIS = {
  "prix-croissant": { prix: 1 },
  "prix-decroissant": { prix: -1 },
  "nom": { nom: 1 },
  "recent": { createdAt: -1 }
};

// GET /api/produits?categorie=Chaussures&q=nike&tri=prix-croissant
exports.lister = async (req, res) => {
  const { categorie, q, tri } = req.query;
  const filtre = {};
  if (categorie) filtre.categorie = categorie;
  if (q) filtre.nom = { $regex: echapperRegex(q), $options: "i" };

  const produits = await Produit.find(filtre).sort(TRIS[tri] || { _id: 1 });
  res.json(produits);
};

// GET /api/produits/:id
exports.obtenir = async (req, res) => {
  const produit = await Produit.findById(req.params.id);
  if (!produit) return res.status(404).json({ message: "Produit introuvable." });
  res.json(produit);
};

// POST /api/produits
exports.creer = async (req, res) => {
  const produit = await Produit.create(choisirChamps(req.body, CHAMPS));
  res.status(201).json(produit);
};

// PUT /api/produits/:id
exports.modifier = async (req, res) => {
  const produit = await Produit.findByIdAndUpdate(req.params.id, choisirChamps(req.body, CHAMPS), {
    new: true,          // renvoie le document après modification
    runValidators: true // applique les règles du schéma
  });
  if (!produit) return res.status(404).json({ message: "Produit introuvable." });
  res.json(produit);
};

// DELETE /api/produits/:id
exports.supprimer = async (req, res) => {
  const produit = await Produit.findByIdAndDelete(req.params.id);
  if (!produit) return res.status(404).json({ message: "Produit introuvable." });
  res.json({ message: "Produit supprimé.", id: produit.id });
};
