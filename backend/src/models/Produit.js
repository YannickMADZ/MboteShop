const mongoose = require("mongoose");
const options = require("./options");

const CATEGORIES = ["Vêtements", "Chaussures", "Accessoires", "Électronique"];

const produitSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom du produit est obligatoire."],
      trim: true,
      maxlength: [100, "Le nom ne doit pas dépasser 100 caractères."]
    },
    prix: {
      type: Number,
      required: [true, "Le prix est obligatoire."],
      min: [0, "Le prix doit être positif."]
    },
    categorie: {
      type: String,
      required: [true, "La catégorie est obligatoire."],
      enum: { values: CATEGORIES, message: "Catégorie invalide : {VALUE}." }
    },
    image: { type: String, trim: true, default: "images/placeholder.svg" },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    vedette: { type: Boolean, default: false }
  },
  options
);

module.exports = mongoose.model("Produit", produitSchema);
module.exports.CATEGORIES = CATEGORIES;
