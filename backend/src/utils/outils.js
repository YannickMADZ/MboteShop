/* Petites fonctions utilitaires partagées par les contrôleurs */

// Erreur avec un code HTTP, interceptée par le middleware gestionErreurs
class ErreurApi extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Ne garde que les champs autorisés du corps de la requête
// (empêche un client d'envoyer "createdAt", "_id", etc.)
function choisirChamps(objet = {}, champsAutorises) {
  const resultat = {};
  champsAutorises.forEach((champ) => {
    if (objet[champ] !== undefined) resultat[champ] = objet[champ];
  });
  return resultat;
}

// Échappe les caractères spéciaux avant de construire une RegExp de recherche
function echapperRegex(texte) {
  return String(texte).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { ErreurApi, choisirChamps, echapperRegex };
