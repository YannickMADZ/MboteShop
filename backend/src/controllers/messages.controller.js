/* Messages du formulaire de contact */
const Message = require("../models/Message");
const { choisirChamps } = require("../utils/outils");

// GET /api/messages?lu=false
exports.lister = async (req, res) => {
  const filtre = {};
  if (req.query.lu === "true") filtre.lu = true;
  if (req.query.lu === "false") filtre.lu = false;
  const messages = await Message.find(filtre).sort({ createdAt: -1 });
  res.json(messages);
};

// GET /api/messages/:id
exports.obtenir = async (req, res) => {
  const message = await Message.findById(req.params.id);
  if (!message) return res.status(404).json({ message: "Message introuvable." });
  res.json(message);
};

// POST /api/messages  (formulaire de contact du site)
exports.creer = async (req, res) => {
  const message = await Message.create(choisirChamps(req.body, ["nom", "email", "sujet", "message"]));
  res.status(201).json(message);
};

// PUT /api/messages/:id  (dashboard : marquer comme lu / non lu)
exports.modifier = async (req, res) => {
  const message = await Message.findByIdAndUpdate(req.params.id, choisirChamps(req.body, ["lu"]), {
    new: true,
    runValidators: true
  });
  if (!message) return res.status(404).json({ message: "Message introuvable." });
  res.json(message);
};

// DELETE /api/messages/:id
exports.supprimer = async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ message: "Message introuvable." });
  res.json({ message: "Message supprimé.", id: message.id });
};
