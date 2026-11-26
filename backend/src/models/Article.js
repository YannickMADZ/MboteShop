const mongoose = require("mongoose");
const options = require("./options");

const articleSchema = new mongoose.Schema(
  {
    titre: {
      type: String,
      required: [true, "Le titre est obligatoire."],
      trim: true,
      maxlength: [150, "Le titre ne doit pas dépasser 150 caractères."]
    },
    auteur: { type: String, trim: true, default: "L'équipe MbotéShop" },
    resume: { type: String, trim: true, maxlength: [300, "Le résumé ne doit pas dépasser 300 caractères."], default: "" },
    contenu: { type: String, required: [true, "Le contenu est obligatoire."], trim: true },
    image: { type: String, trim: true, default: "images/placeholder.svg" },
    publie: { type: Boolean, default: true }
  },
  options
);

module.exports = mongoose.model("Article", articleSchema);
