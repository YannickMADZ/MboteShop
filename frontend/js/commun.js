/* =========================================================
   commun.js — Fonctions partagées par toutes les pages
   - communication avec l'API (fetch)
   - lecture / écriture dans le localStorage
   - logique du panier et de la wishlist
   - badges du header, notifications (toast), dark mode, menu mobile
   - création des cartes produits (DOM)
   ========================================================= */

const CLES = {
  panier: "mbote_panier_v2",
  wishlist: "mbote_wishlist_v2",
  theme: "mbote_theme"
};

/* Photos Unsplash (licence libre, chargées depuis le CDN d'Unsplash) */
const unsplash = (id, largeur = 600, hauteur = 450) =>
  `https://images.unsplash.com/photo-${id}?w=${largeur}&h=${hauteur}&fit=crop&crop=entropy&auto=format&q=75`;

const CATEGORIES = [
  { nom: "Vêtements", image: unsplash("1489987707025-afc232f7ea0f") },
  { nom: "Chaussures", image: unsplash("1460353581641-37baddab0fa2") },
  { nom: "Accessoires", image: unsplash("1523275335684-37898b6baf30") },
  { nom: "Électronique", image: unsplash("1498049794561-7780e7231661") }
];

/* =========================================================
   ICÔNES — petites icônes au trait (SVG), à la place des emojis.
   Dans le HTML : <span data-icone="camion"></span>
   En JavaScript : element.appendChild(icone("camion"))
   ========================================================= */
const ICONES = {
  camion: '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  carte: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
  billet: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>',
  mobile: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  retour: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  bulle: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
  lieu: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  telephone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  horloge: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  loupe: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  panier: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
  coeur: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  alerte: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  valide: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  coche: '<polyline points="20 6 9 17 4 12"/>',
  document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  question: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  lune: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  soleil: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  etiquette: '<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  graphique: '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  sac: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  colis: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  email: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  externe: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  sortie: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  actualiser: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
  etoile: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
};

function icone(nom, classes = []) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("icone", ...classes);
  svg.innerHTML = ICONES[nom] || ICONES.info; // chaînes fixes définies ci-dessus
  return svg;
}

// Remplace chaque <span data-icone="nom"> par l'icône correspondante
function afficherIcones(racine = document) {
  racine.querySelectorAll("[data-icone]").forEach((element) => {
    element.replaceChildren(icone(element.dataset.icone));
  });
}

// Bouton avec une icône et un texte
function contenuAvecIcone(element, nom, texte) {
  element.replaceChildren(icone(nom), document.createTextNode(texte));
}

/* Catalogue chargé depuis l'API (GET /api/produits) */
let PRODUITS = [];
let produitsCharges = false;

/* =========================================================
   API — fonction unique pour parler au backend
   api("/api/produits")                         -> GET
   api("/api/messages", { method: "POST", body: {...} })
   ========================================================= */
async function api(chemin, options = {}) {
  const parametres = {
    method: options.method || "GET",
    headers: { "Content-Type": "application/json" }
  };
  if (options.body) parametres.body = JSON.stringify(options.body);

  let reponse;
  try {
    reponse = await fetch(API_URL + chemin, parametres);
  } catch (erreur) {
    throw new Error("Impossible de joindre le serveur. Vérifiez votre connexion.");
  }

  const donnees = await reponse.json().catch(() => null);
  if (!reponse.ok) {
    const details = donnees && donnees.erreurs ? " " + donnees.erreurs.join(" ") : "";
    const message = (donnees && donnees.message) || "Erreur " + reponse.status;
    const erreur = new Error(message + details);
    erreur.status = reponse.status;
    throw erreur;
  }
  return donnees;
}

async function chargerProduits() {
  PRODUITS = await api("/api/produits");
  produitsCharges = true;
  majBadges(); // recalcul une fois les produits connus
  return PRODUITS;
}

/* ---------- localStorage ---------- */
function lireStockage(cle, valeurParDefaut) {
  try {
    const brut = localStorage.getItem(cle);
    return brut ? JSON.parse(brut) : valeurParDefaut;
  } catch (erreur) {
    return valeurParDefaut; // donnée corrompue -> on repart de zéro
  }
}

function ecrireStockage(cle, valeur) {
  localStorage.setItem(cle, JSON.stringify(valeur));
}

/* ---------- Utilitaires ---------- */
function formaterPrix(montant) {
  // 35000 -> "35 000 FCFA"
  return Math.round(montant).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " FCFA";
}

function formaterDate(dateISO) {
  return new Date(dateISO).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function trouverProduit(id) {
  return PRODUITS.find((produit) => produit.id === String(id));
}

// Petit raccourci : crée un élément, lui ajoute des classes et un texte
function creerElement(balise, classes = [], texte = "") {
  const element = document.createElement(balise);
  if (classes.length) element.classList.add(...classes);
  if (texte !== "") element.textContent = texte;
  return element;
}

/* Messages d'état dans un conteneur (chargement / erreur) */
function afficherChargement(conteneur, texte = "Chargement…") {
  conteneur.textContent = "";
  const bloc = creerElement("div", ["chargement"]);
  bloc.appendChild(creerElement("span", ["spinner"]));
  bloc.appendChild(creerElement("p", [], texte));
  conteneur.appendChild(bloc);
}

function afficherErreur(conteneur, erreur) {
  conteneur.textContent = "";
  const bloc = creerElement("div", ["message-vide", "message-erreur"]);
  const symbole = creerElement("span", ["emoji"]);
  symbole.appendChild(icone("alerte"));
  bloc.appendChild(symbole);
  bloc.appendChild(creerElement("p", [], erreur.message || "Une erreur est survenue."));
  const bouton = creerElement("button", ["btn", "btn-outline"], "Réessayer");
  bouton.type = "button";
  bouton.addEventListener("click", () => window.location.reload());
  bloc.appendChild(bouton);
  conteneur.appendChild(bloc);
}

/* =========================================================
   PANIER — tableau de lignes : [{ id: "665f…", quantite: 2 }, ...]
   ========================================================= */
function getPanier() {
  const panier = lireStockage(CLES.panier, []);
  // Une fois le catalogue chargé, on ignore les produits supprimés par l'admin
  return produitsCharges ? panier.filter((ligne) => trouverProduit(ligne.id)) : panier;
}

function sauvegarderPanier(panier) {
  ecrireStockage(CLES.panier, panier);
  majBadges();
}

function ajouterAuPanier(id, quantite = 1, silencieux = false) {
  const panier = getPanier();
  const ligneExistante = panier.find((ligne) => ligne.id === id);

  if (ligneExistante) {
    ligneExistante.quantite += quantite;          // produit déjà présent -> quantité +
  } else {
    panier.push({ id: id, quantite: quantite });  // nouveau produit
  }

  sauvegarderPanier(panier);
  if (!silencieux) {
    animerBadge("#badge-panier");
    afficherToast(trouverProduit(id).nom + " ajouté au panier", "panier");
  }
}

function nombreArticlesPanier() {
  return getPanier().reduce((total, ligne) => total + ligne.quantite, 0);
}

/* =========================================================
   WISHLIST — tableau d'identifiants : ["665f…", "6660…"]
   ========================================================= */
function getWishlist() {
  const wishlist = lireStockage(CLES.wishlist, []);
  return produitsCharges ? wishlist.filter((id) => trouverProduit(id)) : wishlist;
}

function estFavori(id) {
  return getWishlist().includes(id);
}

function ajouterFavori(id) {
  const wishlist = getWishlist();
  if (!wishlist.includes(id)) {
    wishlist.push(id);
    ecrireStockage(CLES.wishlist, wishlist);
    majBadges();
    animerBadge("#badge-wishlist");
    afficherToast(trouverProduit(id).nom + " ajouté aux favoris", "coeur");
  }
}

function retirerFavori(id) {
  const wishlist = getWishlist().filter((idFavori) => idFavori !== id);
  ecrireStockage(CLES.wishlist, wishlist);
  majBadges();
  afficherToast(trouverProduit(id).nom + " retiré des favoris", "info");
}

function basculerFavori(id) {
  if (estFavori(id)) retirerFavori(id);
  else ajouterFavori(id);
}

/* ---------- Badges du header ---------- */
function majBadge(selecteur, valeur) {
  const badge = document.querySelector(selecteur);
  if (!badge) return;
  badge.textContent = valeur;
  badge.classList.toggle("vide", valeur === 0);
}

function majBadges() {
  majBadge("#badge-panier", nombreArticlesPanier());
  majBadge("#badge-wishlist", getWishlist().length);
}

function animerBadge(selecteur) {
  const badge = document.querySelector(selecteur);
  if (!badge) return;
  badge.classList.remove("pop");
  void badge.offsetWidth; // force le navigateur à relancer l'animation
  badge.classList.add("pop");
}

/* ---------- Notification "toast" ---------- */
// type : "succes" (par défaut), "erreur", ou le nom d'une icône ("panier", "coeur", "info"…)
function afficherToast(message, type = "succes") {
  let zone = document.querySelector(".toast-zone");
  if (!zone) {
    zone = creerElement("div", ["toast-zone"]);
    zone.setAttribute("aria-live", "polite");
    document.body.appendChild(zone);
  }
  const toast = creerElement("div", ["toast"]);
  if (type === "erreur") toast.classList.add("toast-erreur");
  const nomIcone = { succes: "valide", erreur: "alerte" }[type] || type;
  toast.appendChild(icone(nomIcone));
  toast.appendChild(creerElement("span", [], message));
  zone.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("sortie");
    toast.addEventListener("animationend", () => toast.remove());
  }, 2800);
}

/* ---------- Boutons réutilisables ---------- */
function creerBoutonPanier(id, texte = "Ajouter au panier") {
  const bouton = creerElement("button", ["btn", "btn-primary", "btn-sm"]);
  bouton.type = "button";
  contenuAvecIcone(bouton, "panier", texte);
  bouton.addEventListener("click", () => {
    ajouterAuPanier(id);
    bouton.classList.add("ajoute");
    contenuAvecIcone(bouton, "coche", "Ajouté");
    setTimeout(() => {
      bouton.classList.remove("ajoute");
      contenuAvecIcone(bouton, "panier", texte);
    }, 1200);
  });
  return bouton;
}

function creerBoutonFavori(id) {
  const bouton = creerElement("button", ["btn", "btn-outline", "btn-sm", "btn-favori"]);
  bouton.type = "button";

  function mettreAJour() {
    const favori = estFavori(id);
    contenuAvecIcone(bouton, "coeur", favori ? "Dans les favoris" : "Favoris");
    bouton.classList.toggle("actif", favori);
  }

  mettreAJour();
  bouton.addEventListener("click", () => {
    basculerFavori(id);
    mettreAJour();
  });
  return bouton;
}

/* ---------- Carte produit (utilisée sur plusieurs pages) ---------- */
function creerCarteProduit(produit) {
  const carte = creerElement("article", ["carte-produit"]);

  const lienImage = creerElement("a", ["carte-produit__image"]);
  lienImage.href = "produit.html?id=" + produit.id;
  const image = document.createElement("img");
  image.src = produit.image;
  image.alt = produit.nom;
  image.loading = "lazy";
  image.addEventListener("error", () => { image.src = "images/placeholder.svg"; }, { once: true });
  lienImage.appendChild(image);

  const corps = creerElement("div", ["carte-produit__corps"]);
  const categorie = creerElement("span", ["tag"], produit.categorie);
  const nom = creerElement("a", ["carte-produit__nom"], produit.nom);
  nom.href = "produit.html?id=" + produit.id;
  const prix = creerElement("p", ["prix"], formaterPrix(produit.prix));

  const actions = creerElement("div", ["carte-produit__actions"]);
  actions.appendChild(creerBoutonPanier(produit.id));
  actions.appendChild(creerBoutonFavori(produit.id));

  corps.appendChild(categorie);
  corps.appendChild(nom);
  corps.appendChild(prix);
  corps.appendChild(actions);

  carte.appendChild(lienImage);
  carte.appendChild(corps);
  return carte;
}

/* ---------- Carte article du blog (accueil + page blog) ---------- */
function creerCarteArticle(article) {
  const carte = creerElement("article", ["carte-article"]);

  const lienImage = creerElement("a", ["carte-article__image"]);
  lienImage.href = "article.html?id=" + article.id;
  const image = document.createElement("img");
  image.src = article.image;
  image.alt = "";
  image.loading = "lazy";
  image.addEventListener("error", () => { image.src = "images/placeholder.svg"; }, { once: true });
  lienImage.appendChild(image);

  const corps = creerElement("div", ["carte-article__corps"]);
  corps.appendChild(creerElement("span", ["carte-article__date"], formaterDate(article.createdAt)));
  const titre = creerElement("a", ["carte-article__titre"], article.titre);
  titre.href = "article.html?id=" + article.id;
  corps.appendChild(titre);
  corps.appendChild(creerElement("p", [], article.resume));
  const lire = creerElement("a", ["lien-fleche"], "Lire l'article →");
  lire.href = "article.html?id=" + article.id;
  corps.appendChild(lire);

  carte.appendChild(lienImage);
  carte.appendChild(corps);
  return carte;
}

/* ---------- Dark mode ---------- */
function appliquerTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const bouton = document.querySelector("#btn-theme");
  if (bouton) bouton.replaceChildren(icone(theme === "dark" ? "soleil" : "lune"));
}

function initTheme() {
  const themeSauvegarde = lireStockage(CLES.theme, null);
  const prefereSombre = window.matchMedia("(prefers-color-scheme: dark)").matches;
  appliquerTheme(themeSauvegarde || (prefereSombre ? "dark" : "light"));

  const bouton = document.querySelector("#btn-theme");
  if (!bouton) return;
  bouton.addEventListener("click", () => {
    const nouveau = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    appliquerTheme(nouveau);
    ecrireStockage(CLES.theme, nouveau);
  });
}

/* ---------- Menu mobile ---------- */
function initMenuMobile() {
  const bouton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (!bouton || !nav) return;
  bouton.addEventListener("click", () => {
    const ouvert = nav.classList.toggle("ouvert");
    bouton.setAttribute("aria-expanded", ouvert);
  });
}

/* ---------- Initialisation commune ---------- */
afficherIcones();
initTheme();
initMenuMobile();
majBadges();

// Si le panier change dans un autre onglet, on met à jour les badges
window.addEventListener("storage", majBadges);
