/* CRUD des articles du blog */
const Article = require("../models/Article");
const { choisirChamps } = require("../utils/outils");

const CHAMPS = ["titre", "auteur", "resume", "contenu", "image", "publie"];

// GET /api/articles          -> articles publiés (site public)
// GET /api/articles?tous=true -> tous les articles, brouillons compris (dashboard)
exports.lister = async (req, res) => {
  const filtre = req.query.tous === "true" ? {} : { publie: true };
  const articles = await Article.find(filtre).sort({ createdAt: -1 });
  res.json(articles);
};

// GET /api/articles/:id
exports.obtenir = async (req, res) => {
  const article = await Article.findById(req.params.id);
  if (!article) return res.status(404).json({ message: "Article introuvable." });
  res.json(article);
};

// POST /api/articles
exports.creer = async (req, res) => {
  const article = await Article.create(choisirChamps(req.body, CHAMPS));
  res.status(201).json(article);
};

// PUT /api/articles/:id
exports.modifier = async (req, res) => {
  const article = await Article.findByIdAndUpdate(req.params.id, choisirChamps(req.body, CHAMPS), {
    new: true,
    runValidators: true
  });
  if (!article) return res.status(404).json({ message: "Article introuvable." });
  res.json(article);
};

// DELETE /api/articles/:id
exports.supprimer = async (req, res) => {
  const article = await Article.findByIdAndDelete(req.params.id);
  if (!article) return res.status(404).json({ message: "Article introuvable." });
  res.json({ message: "Article supprimé.", id: article.id });
};
