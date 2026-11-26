/* =========================================================
   tarifs.js — Règles de prix appliquées CÔTÉ SERVEUR.
   Le frontend affiche une estimation, mais c'est le serveur qui
   recalcule le total final à partir des prix en base de données :
   un client ne peut donc pas modifier les prix depuis son navigateur.
   ========================================================= */
const { ErreurApi } = require("./outils");

const CODES_PROMO = {
  BIENVENUE10: { type: "pourcentage", valeur: 10 },
  MBOTE5000: { type: "montant", valeur: 5000 },
  LIVRAISONOFFERTE: { type: "livraison", valeur: 0 }
};

const FRAIS_LIVRAISON = {
  "Brazzaville": 2000,
  "Pointe-Noire": 3500,
  "Dolisie": 4000,
  "Autre ville": 5000
};

const SEUIL_LIVRAISON_GRATUITE = 100000;

function calculerTotaux(lignes, codeSaisi, ville) {
  const sousTotal = lignes.reduce((total, ligne) => total + ligne.prix * ligne.quantite, 0);

  let codePromo = null;
  let remise = 0;
  let livraisonOfferte = false;

  if (codeSaisi) {
    codePromo = String(codeSaisi).trim().toUpperCase();
    const code = CODES_PROMO[codePromo];
    if (!code) throw new ErreurApi(400, `Code promo « ${codePromo} » invalide.`);
    if (code.type === "pourcentage") remise = Math.round((sousTotal * code.valeur) / 100);
    if (code.type === "montant") remise = Math.min(code.valeur, sousTotal);
    if (code.type === "livraison") livraisonOfferte = true;
  }

  if (!(ville in FRAIS_LIVRAISON)) throw new ErreurApi(400, "Ville de livraison invalide.");
  const livraison = livraisonOfferte || sousTotal >= SEUIL_LIVRAISON_GRATUITE ? 0 : FRAIS_LIVRAISON[ville];

  return { sousTotal, codePromo, remise, livraison, total: sousTotal - remise + livraison };
}

module.exports = { calculerTotaux, CODES_PROMO, FRAIS_LIVRAISON, SEUIL_LIVRAISON_GRATUITE };
