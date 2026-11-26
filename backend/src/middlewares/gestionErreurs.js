/* =========================================================
   gestionErreurs.js — Transforme toutes les erreurs en réponse JSON.
   Express 5 transmet automatiquement ici les erreurs des fonctions async.
   ========================================================= */
// eslint-disable-next-line no-unused-vars
module.exports = (erreur, req, res, next) => {
  // Champ manquant ou invalide (règles du schéma Mongoose)
  if (erreur.name === "ValidationError") {
    return res.status(400).json({
      message: "Données invalides.",
      erreurs: Object.values(erreur.errors).map((e) => e.message)
    });
  }

  // Identifiant MongoDB mal formé (ex : /api/produits/abc)
  if (erreur.name === "CastError") {
    return res.status(400).json({ message: "Identifiant invalide." });
  }

  // Valeur unique déjà utilisée
  if (erreur.code === 11000) {
    return res.status(409).json({ message: "Cette valeur existe déjà." });
  }

  // Corps de requête qui n'est pas du JSON valide
  if (erreur.type === "entity.parse.failed") {
    return res.status(400).json({ message: "JSON invalide." });
  }

  // Erreurs volontaires (ErreurApi)
  if (erreur.status && erreur.status < 500) {
    return res.status(erreur.status).json({ message: erreur.message });
  }

  console.error("💥 Erreur serveur :", erreur);
  res.status(500).json({ message: "Erreur interne du serveur." });
};
