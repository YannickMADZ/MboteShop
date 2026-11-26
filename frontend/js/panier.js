/* =========================================================
   panier.js — Page panier : quantités, totaux, code promo,
   frais de livraison et simulation de commande
   ========================================================= */

/* ---------- Éléments du DOM ---------- */
const listePanier = document.querySelector("#liste-panier");
const zonePanier = document.querySelector("#zone-panier");
const panierVide = document.querySelector("#panier-vide");
const compteurPanier = document.querySelector("#panier-compteur");
const boutonVider = document.querySelector("#vider-panier");

const recapArticles = document.querySelector("#recap-articles");
const recapSousTotal = document.querySelector("#recap-sous-total");
const ligneRemise = document.querySelector("#ligne-remise");
const recapRemise = document.querySelector("#recap-remise");
const recapLivraison = document.querySelector("#recap-livraison");
const infoLivraison = document.querySelector("#info-livraison");
const recapTotal = document.querySelector("#recap-total");

const formPromo = document.querySelector("#form-promo");
const champPromo = document.querySelector("#code-promo");
const messagePromo = document.querySelector("#message-promo");

const formLivraison = document.querySelector("#form-livraison");
const selectVille = document.querySelector("#ville");

const modal = document.querySelector("#modal-commande");
const modalTexte = document.querySelector("#modal-texte");
const modalRecap = document.querySelector("#modal-recap");

/* ---------- Règles commerciales ---------- */
const CODES_PROMO = {
  BIENVENUE10: { type: "pourcentage", valeur: 10, libelle: "-10 % sur le sous-total" },
  MBOTE5000: { type: "montant", valeur: 5000, libelle: "-5 000 FCFA" },
  LIVRAISONOFFERTE: { type: "livraison", valeur: 0, libelle: "Livraison offerte" }
};

const FRAIS_LIVRAISON = {
  "Brazzaville": 2000,
  "Pointe-Noire": 3500,
  "Dolisie": 4000,
  "Autre ville": 5000
};

const SEUIL_LIVRAISON_GRATUITE = 100000;

let codeApplique = null;

/* =========================================================
   CALCUL DES TOTAUX
   total ligne  = prix unitaire × quantité
   sous-total   = somme des totaux de ligne (reduce)
   total à payer = sous-total − remise + livraison
   ========================================================= */
function calculerTotaux(panier) {
  const sousTotal = panier.reduce((total, ligne) => {
    return total + trouverProduit(ligne.id).prix * ligne.quantite;
  }, 0);

  const code = codeApplique ? CODES_PROMO[codeApplique] : null;
  let remise = 0;
  if (code && code.type === "pourcentage") remise = Math.round((sousTotal * code.valeur) / 100);
  if (code && code.type === "montant") remise = Math.min(code.valeur, sousTotal);

  const ville = selectVille.value;
  let livraison = ville ? FRAIS_LIVRAISON[ville] : 0;
  const livraisonGratuite = sousTotal >= SEUIL_LIVRAISON_GRATUITE || (code && code.type === "livraison");
  if (livraisonGratuite) livraison = 0;

  return {
    sousTotal: sousTotal,
    remise: remise,
    livraison: livraison,
    livraisonGratuite: livraisonGratuite,
    villeChoisie: Boolean(ville),
    total: sousTotal - remise + livraison
  };
}

/* ---------- Actions sur le panier ---------- */
function modifierQuantite(id, variation) {
  const panier = getPanier();
  const ligne = panier.find((l) => l.id === id);
  if (!ligne) return;

  ligne.quantite += variation;
  if (ligne.quantite <= 0) {
    supprimerProduit(id); // quantité à 0 => on retire le produit
    return;
  }
  sauvegarderPanier(panier);
  afficherPanier();
}

function supprimerProduit(id) {
  const panier = getPanier().filter((ligne) => ligne.id !== id);
  sauvegarderPanier(panier);
  afficherToast(trouverProduit(id).nom + " retiré du panier", "info");
  afficherPanier();
}

function viderPanier() {
  if (!confirm("Voulez-vous vraiment vider votre panier ?")) return;
  sauvegarderPanier([]);
  codeApplique = null;
  afficherPanier();
}

/* ---------- Construction d'une ligne du panier (DOM) ---------- */
function creerCellule(classe, libelleMobile, texte) {
  const cellule = creerElement("div", [classe]);
  cellule.appendChild(creerElement("span", ["label-mobile"], libelleMobile));
  if (texte) cellule.appendChild(creerElement("span", [], texte));
  return cellule;
}

function creerLignePanier(ligne) {
  const produit = trouverProduit(ligne.id);
  const totalLigne = produit.prix * ligne.quantite;

  const element = creerElement("div", ["ligne-panier"]);
  element.dataset.id = produit.id;

  // Produit (image + nom + catégorie)
  const celluleProduit = creerElement("div", ["lp-produit"]);
  const image = document.createElement("img");
  image.src = produit.image;
  image.alt = produit.nom;
  const texte = creerElement("div");
  const nom = creerElement("a", ["lp-nom"], produit.nom);
  nom.href = "produit.html?id=" + produit.id;
  texte.appendChild(nom);
  texte.appendChild(creerElement("small", [], produit.categorie));
  celluleProduit.appendChild(image);
  celluleProduit.appendChild(texte);

  // Prix unitaire
  const cellulePrix = creerCellule("lp-prix", "Prix unitaire", formaterPrix(produit.prix));

  // Quantité [-] 2 [+]
  const celluleQuantite = creerCellule("lp-quantite", "Quantité");
  const selecteur = creerElement("div", ["quantite"]);
  const moins = creerElement("button", [], "−");
  const valeur = creerElement("span", [], String(ligne.quantite));
  const plus = creerElement("button", [], "+");
  moins.type = plus.type = "button";
  moins.setAttribute("aria-label", "Diminuer la quantité de " + produit.nom);
  plus.setAttribute("aria-label", "Augmenter la quantité de " + produit.nom);
  moins.addEventListener("click", () => modifierQuantite(produit.id, -1));
  plus.addEventListener("click", () => modifierQuantite(produit.id, +1));
  selecteur.appendChild(moins);
  selecteur.appendChild(valeur);
  selecteur.appendChild(plus);
  celluleQuantite.appendChild(selecteur);

  // Total de la ligne
  const celluleTotal = creerCellule("lp-total", "Total", formaterPrix(totalLigne));

  // Action : supprimer
  const celluleAction = creerElement("div", ["lp-action"]);
  const boutonSupprimer = creerElement("button", ["btn-supprimer"], "Supprimer");
  boutonSupprimer.type = "button";
  boutonSupprimer.addEventListener("click", () => supprimerProduit(produit.id));
  celluleAction.appendChild(boutonSupprimer);

  [celluleProduit, cellulePrix, celluleQuantite, celluleTotal, celluleAction]
    .forEach((cellule) => element.appendChild(cellule));
  return element;
}

/* ---------- Affichage ---------- */
function afficherRecapitulatif(panier) {
  const totaux = calculerTotaux(panier);
  const nbArticles = panier.reduce((t, l) => t + l.quantite, 0);

  recapArticles.textContent = nbArticles;
  recapSousTotal.textContent = formaterPrix(totaux.sousTotal);

  ligneRemise.classList.toggle("cache", totaux.remise === 0);
  recapRemise.textContent = "− " + formaterPrix(totaux.remise);

  if (totaux.livraisonGratuite) recapLivraison.textContent = "Offerte";
  else if (!totaux.villeChoisie) recapLivraison.textContent = "Choisir une ville";
  else recapLivraison.textContent = formaterPrix(totaux.livraison);

  const reste = SEUIL_LIVRAISON_GRATUITE - totaux.sousTotal;
  infoLivraison.textContent = reste > 0
    ? "Plus que " + formaterPrix(reste) + " pour la livraison gratuite !"
    : "Vous bénéficiez de la livraison gratuite.";

  recapTotal.textContent = formaterPrix(totaux.total);
}

function afficherPanier() {
  const panier = getPanier();
  const vide = panier.length === 0;

  zonePanier.classList.toggle("cache", vide);
  panierVide.classList.toggle("cache", !vide);

  const nbArticles = panier.reduce((t, l) => t + l.quantite, 0);
  compteurPanier.textContent = vide ? "" : nbArticles + (nbArticles > 1 ? " articles" : " article");

  listePanier.textContent = "";
  panier.forEach((ligne) => listePanier.appendChild(creerLignePanier(ligne)));

  afficherRecapitulatif(panier);
  afficherCodeApplique();
}

/* ---------- Code promo ---------- */
function afficherMessagePromo(texte, type) {
  messagePromo.textContent = texte;
  messagePromo.classList.remove("succes", "erreur");
  if (type) messagePromo.classList.add(type);
}

function afficherCodeApplique() {
  if (!codeApplique) return;
  messagePromo.textContent = "";
  messagePromo.classList.remove("erreur");
  messagePromo.classList.add("succes");
  messagePromo.appendChild(document.createTextNode(codeApplique + " : " + CODES_PROMO[codeApplique].libelle + " "));
  const retirer = creerElement("button", ["lien-retirer"], "Retirer");
  retirer.type = "button";
  retirer.addEventListener("click", () => {
    codeApplique = null;
    afficherMessagePromo("", null);
    afficherRecapitulatif(getPanier());
  });
  messagePromo.appendChild(retirer);
}

formPromo.addEventListener("submit", (evenement) => {
  evenement.preventDefault();
  const code = champPromo.value.trim().toUpperCase();

  if (!code) {
    afficherMessagePromo("Veuillez saisir un code.", "erreur");
  } else if (!CODES_PROMO[code]) {
    afficherMessagePromo("Code « " + code + " » invalide.", "erreur");
  } else {
    codeApplique = code;
    champPromo.value = "";
    afficherCodeApplique();
    afficherRecapitulatif(getPanier());
    afficherToast("Code promo appliqué", "etiquette");
  }
});

/* ---------- Formulaire de livraison + validation ---------- */
const REGLES = {
  nom: (v) => v.trim().length >= 3 || "Entrez votre nom complet (3 caractères min.).",
  telephone: (v) => /^\+?[0-9 ]{9,15}$/.test(v.trim()) || "Numéro de téléphone invalide.",
  adresse: (v) => v.trim().length >= 5 || "Entrez une adresse de livraison.",
  ville: (v) => v !== "" || "Choisissez une ville."
};

function validerChamp(nomChamp) {
  const champ = formLivraison.elements[nomChamp];
  const resultat = REGLES[nomChamp](champ.value);
  const zoneErreur = document.querySelector("#erreur-" + nomChamp);
  const valide = resultat === true;

  champ.classList.toggle("invalide", !valide);
  zoneErreur.textContent = valide ? "" : resultat;
  return valide;
}

// Validation en direct pendant la saisie
Object.keys(REGLES).forEach((nomChamp) => {
  formLivraison.elements[nomChamp].addEventListener("input", () => validerChamp(nomChamp));
});

// Le choix de la ville modifie les frais de livraison
selectVille.addEventListener("change", () => afficherRecapitulatif(getPanier()));

formLivraison.addEventListener("submit", (evenement) => {
  evenement.preventDefault();

  const tousValides = Object.keys(REGLES).map(validerChamp).every(Boolean);
  if (!tousValides) {
    afficherToast("Vérifiez les informations de livraison", "erreur");
    formLivraison.querySelector(".invalide").focus();
    return;
  }

  passerCommande();
});

/* ---------- Envoi de la commande au backend ---------- */
const boutonCommander = document.querySelector("#btn-commander");

async function passerCommande() {
  const panier = getPanier();
  const donnees = new FormData(formLivraison);

  // Le serveur ne reçoit que des id et des quantités :
  // il recalcule lui-même les prix et le total depuis MongoDB.
  const corps = {
    client: {
      nom: donnees.get("nom"),
      telephone: donnees.get("telephone"),
      adresse: donnees.get("adresse"),
      ville: donnees.get("ville")
    },
    paiement: donnees.get("paiement"),
    codePromo: codeApplique,
    lignes: panier.map((ligne) => ({ produit: ligne.id, quantite: ligne.quantite }))
  };

  boutonCommander.disabled = true;
  boutonCommander.textContent = "Envoi en cours…";

  try {
    const commande = await api("/api/commandes", { method: "POST", body: corps }); // POST /api/commandes
    ouvrirConfirmation(commande);

    // Remise à zéro
    sauvegarderPanier([]);
    codeApplique = null;
    formLivraison.reset();
    afficherMessagePromo("", null);
    afficherPanier();
  } catch (erreur) {
    afficherToast(erreur.message, "erreur");
  } finally {
    boutonCommander.disabled = false;
    boutonCommander.textContent = "Confirmer la commande";
  }
}

function ouvrirConfirmation(commande) {
  modalTexte.textContent = "Merci " + commande.client.nom + " ! Votre commande " + commande.numero +
    " sera livrée à " + commande.client.ville + ". Nous vous appellerons au " + commande.client.telephone + ".";

  modalRecap.textContent = "";
  commande.lignes.forEach((ligne) => {
    const ligneRecap = creerElement("div", ["recap-ligne"]);
    ligneRecap.appendChild(creerElement("span", [], ligne.quantite + " × " + ligne.nom));
    ligneRecap.appendChild(creerElement("strong", [], formaterPrix(ligne.total)));
    modalRecap.appendChild(ligneRecap);
  });
  [["Remise", commande.remise ? "− " + formaterPrix(commande.remise) : null],
   ["Livraison", commande.livraison ? formaterPrix(commande.livraison) : "Offerte"]].forEach(([libelle, valeur]) => {
    if (valeur === null) return;
    const ligne = creerElement("div", ["recap-ligne"]);
    ligne.appendChild(creerElement("span", [], libelle));
    ligne.appendChild(creerElement("strong", [], valeur));
    modalRecap.appendChild(ligne);
  });
  const total = creerElement("div", ["recap-ligne", "recap-ligne--total"]);
  total.appendChild(creerElement("span", [], "Total (" + commande.paiement + ")"));
  total.appendChild(creerElement("strong", [], formaterPrix(commande.total)));
  modalRecap.appendChild(total);

  modal.classList.add("ouvert");
}

modal.addEventListener("click", (evenement) => {
  if (evenement.target === modal || evenement.target.matches("[data-fermer]")) {
    modal.classList.remove("ouvert");
  }
});

document.addEventListener("keydown", (evenement) => {
  if (evenement.key === "Escape") modal.classList.remove("ouvert");
});

boutonVider.addEventListener("click", viderPanier);

/* ---------- Démarrage : on charge le catalogue (prix à jour) ---------- */
async function demarrer() {
  afficherChargement(listePanier, "Chargement du panier…");
  try {
    await chargerProduits();   // GET /api/produits
    afficherPanier();
  } catch (erreur) {
    afficherErreur(listePanier, erreur);
  }
}

demarrer();
