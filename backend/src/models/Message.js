const mongoose = require("mongoose");
const options = require("./options");

const messageSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, "Le nom est obligatoire."], trim: true, maxlength: 100 },
    email: {
      type: String,
      required: [true, "L'email est obligatoire."],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Adresse email invalide."]
    },
    sujet: { type: String, trim: true, maxlength: 150, default: "Sans sujet" },
    message: {
      type: String,
      required: [true, "Le message est obligatoire."],
      trim: true,
      minlength: [10, "Le message doit contenir au moins 10 caractères."],
      maxlength: [3000, "Le message ne doit pas dépasser 3000 caractères."]
    },
    lu: { type: Boolean, default: false }
  },
  options
);

module.exports = mongoose.model("Message", messageSchema);
