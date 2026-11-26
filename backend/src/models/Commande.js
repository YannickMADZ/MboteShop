const mongoose = require("mongoose");
const options = require("./options");

const STATUTS = ["en attente", "confirmée", "expédiée", "livrée", "annulée"];
const PAIEMENTS = ["Paiement à la livraison", "Mobile Money", "Carte bancaire"];

// Numéro lisible : CMD-261124-4F7K
function genererNumero() {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const aleatoire = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CMD-${date}-${aleatoire}`;
}

// Une ligne garde une copie du nom et du prix au moment de l'achat :
// si le produit change de prix plus tard, la commande reste juste.
const ligneSchema = new mongoose.Schema(
  {
    produit: { type: mongoose.Schema.Types.ObjectId, ref: "Produit", required: true },
    nom: { type: String, required: true },
    prix: { type: Number, required: true, min: 0 },
    quantite: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const commandeSchema = new mongoose.Schema(
  {
    numero: { type: String, unique: true, default: genererNumero },
    client: {
      nom: { type: String, required: [true, "Le nom du client est obligatoire."], trim: true, minlength: [3, "Le nom doit contenir au moins 3 caractères."] },
      telephone: {
        type: String,
        required: [true, "Le téléphone est obligatoire."],
        trim: true,
        match: [/^\+?[0-9 ]{9,15}$/, "Numéro de téléphone invalide."]
      },
      adresse: { type: String, required: [true, "L'adresse est obligatoire."], trim: true, minlength: [5, "L'adresse doit contenir au moins 5 caractères."] },
      ville: { type: String, required: [true, "La ville est obligatoire."], trim: true }
    },
    paiement: {
      type: String,
      enum: { values: PAIEMENTS, message: "Mode de paiement invalide." },
      default: "Paiement à la livraison"
    },
    lignes: {
      type: [ligneSchema],
      validate: [(lignes) => lignes.length > 0, "Une commande doit contenir au moins un produit."]
    },
    codePromo: { type: String, default: null },
    sousTotal: { type: Number, required: true, min: 0 },
    remise: { type: Number, default: 0, min: 0 },
    livraison: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    statut: {
      type: String,
      enum: { values: STATUTS, message: "Statut invalide : {VALUE}." },
      default: "en attente"
    }
  },
  options
);

module.exports = mongoose.model("Commande", commandeSchema);
module.exports.STATUTS = STATUTS;
