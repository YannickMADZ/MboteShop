/* =========================================================
   admin.js — Dashboard d'administration (CRUD via l'API REST)
   Utilise les fonctions de commun.js : api(), creerElement(),
   formaterPrix(), formaterDate(), afficherToast(), CATEGORIES.
   ========================================================= */

const STATUTS = ["en attente", "confirmée", "expédiée", "livrée", "annulée"];

/* =========================================================
   1. ACCÈS SIMPLE (pas d'authentification serveur, comme demandé)
   ========================================================= */
const ecranAcces = document.querySelector("#ecran-acces");
const dashboard = document.querySelector("#dashboard");
const formAcces = document.querySelector("#form-acces");

function ouvrirDashboard() {
  ecranAcces.classList.add("cache");
  dashboard.classList.remove("cache");
  afficherSection("accueil");
}

formAcces.addEventListener("submit", (evenement) => {
  evenement.preventDefault();
  const code = document.querySelector("#code-acces").value;
  if (code === ADMIN_CODE) {
    sessionStorage.setItem("mbote_admin", "ok");
    ouvrirDashboard();
  } else {
    document.querySelector("#erreur-acces").textContent = "Code incorrect.";
  }
});

document.querySelector("#btn-deconnexion").addEventListener("click", () => {
  sessionStorage.removeItem("mbote_admin");
  window.location.reload();
});

/* =========================================================
   2. OUTILS D'AFFICHAGE
   ========================================================= */
function cellule(contenu, classes = []) {
  const td = creerElement("td", classes);
  if (contenu instanceof Node) td.appendChild(contenu);
  else td.textContent = contenu;
  return td;
}

function ligneTableau(cellules, classes = []) {
  const tr = creerElement("tr", classes);
  cellules.forEach((c) => tr.appendChild(c instanceof Node && c.tagName === "TD" ? c : cellule(c)));
  return tr;
}

function ligneVide(tbody, nbColonnes, texte) {
  tbody.textContent = "";
  const td = creerElement("td", [], texte);
  td.colSpan = nbColonnes;
  tbody.appendChild(ligneTableau([td], ["vide"]));
}

function boutonAction(texte, action, danger = false) {
  const bouton = creerElement("button", ["btn-action"], texte);
  bouton.type = "button";
  if (danger) bouton.classList.add("danger");
  bouton.addEventListener("click", action);
  return bouton;
}

function groupeActions(...boutons) {
  const div = creerElement("div", ["actions"]);
  boutons.forEach((b) => div.appendChild(b));
  return cellule(div, ["a-droite"]);
}

function badgeStatut(texte) {
  const classe = texte.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-");
  return creerElement("span", ["statut", "statut--" + classe], texte);
}

function cellulePrincipale(image, titre, sousTitre) {
  const div = creerElement("div", ["cellule-produit"]);
  const img = document.createElement("img");
  img.src = image || "images/placeholder.svg";
  img.alt = "";
  img.addEventListener("error", () => { img.src = "images/placeholder.svg"; }, { once: true });
  const texte = creerElement("div");
  texte.appendChild(creerElement("strong", [], titre));
  if (sousTitre) texte.appendChild(creerElement("small", [], sousTitre));
  div.appendChild(img);
  div.appendChild(texte);
  return div;
}

function dateCourte(dateISO) {
  return new Date(dateISO).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

async function confirmerEtSupprimer(message, chemin, apres) {
  if (!confirm(message)) return;
  try {
    await api(chemin, { method: "DELETE" });
    afficherToast("Élément supprimé", "info");
    apres();
  } catch (erreur) {
    afficherToast(erreur.message, "erreur");
  }
}

/* Formulaires : remplir / lire automatiquement selon l'attribut "name" */
function remplirFormulaire(form, objet = {}) {
  form.reset();
  Array.from(form.elements).forEach((champ) => {
    if (!champ.name || !(champ.name in objet)) return;
    if (champ.type === "checkbox") champ.checked = Boolean(objet[champ.name]);
    else champ.value = objet[champ.name] ?? "";
  });
}

function lireFormulaire(form) {
  const donnees = {};
  Array.from(form.elements).forEach((champ) => {
    if (!champ.name) return;
    if (champ.type === "checkbox") donnees[champ.name] = champ.checked;
    else if (champ.type === "number") donnees[champ.name] = Number(champ.value);
    else donnees[champ.name] = champ.value.trim();
  });
  return donnees;
}

// Boutons "Annuler / Fermer" de toutes les fenêtres
document.querySelectorAll("dialog [data-fermer]").forEach((bouton) => {
  bouton.addEventListener("click", () => bouton.closest("dialog").close());
});

/* =========================================================
   3. NAVIGATION ENTRE LES SECTIONS
   ========================================================= */
const CHARGEURS = {
  accueil: () => chargerStats(),
  produits: () => chargerProduitsAdmin(),
  commandes: () => chargerCommandes(),
  articles: () => chargerArticles(),
  messages: () => chargerMessages()
};

function afficherSection(nom) {
  document.querySelectorAll(".sidebar__lien[data-section]").forEach((lien) => {
    lien.classList.toggle("actif", lien.dataset.section === nom);
  });
  document.querySelectorAll(".panneau").forEach((panneau) => {
    panneau.classList.toggle("actif", panneau.id === "section-" + nom);
  });
  CHARGEURS[nom]();
}

document.querySelectorAll(".sidebar__lien[data-section]").forEach((lien) => {
  lien.addEventListener("click", () => afficherSection(lien.dataset.section));
});
document.querySelectorAll("[data-rafraichir]").forEach((bouton) => {
  bouton.addEventListener("click", () => CHARGEURS[bouton.dataset.rafraichir]());
});

/* =========================================================
   4. VUE D'ENSEMBLE — GET /api/stats
   ========================================================= */
async function chargerStats() {
  const tbody = document.querySelector("#tbody-dernieres");
  ligneVide(tbody, 5, "Chargement…");
  try {
    const stats = await api("/api/stats");
    document.querySelector("#stat-ca").textContent = formaterPrix(stats.chiffreAffaires);
    document.querySelector("#stat-commandes").textContent = stats.commandes;
    document.querySelector("#stat-attente").textContent = (stats.commandesParStatut["en attente"] || 0) + " en attente";
    document.querySelector("#stat-produits").textContent = stats.produits;
    document.querySelector("#stat-messages").textContent = stats.messagesNonLus;
    document.querySelector("#stat-articles").textContent = stats.articles + " article(s) de blog";
    majPastilleMessages(stats.messagesNonLus);

    if (stats.dernieresCommandes.length === 0) return ligneVide(tbody, 5, "Aucune commande pour le moment.");
    tbody.textContent = "";
    stats.dernieresCommandes.forEach((c) => {
      tbody.appendChild(ligneTableau([
        cellule(c.numero, ["nowrap"]), cellule(dateCourte(c.createdAt), ["nowrap"]),
        c.client.nom, cellule(formaterPrix(c.total), ["nowrap"]), cellule(badgeStatut(c.statut))
      ]));
    });
  } catch (erreur) {
    ligneVide(tbody, 5, erreur.message);
  }
}

function majPastilleMessages(nombre) {
  const pastille = document.querySelector("#pastille-messages");
  pastille.textContent = nombre;
  pastille.classList.toggle("cache", nombre === 0);
}

/* =========================================================
   5. PRODUITS — CRUD complet
   ========================================================= */
let produitsAdmin = [];
const tbodyProduits = document.querySelector("#tbody-produits");
const rechercheProduits = document.querySelector("#recherche-produits");
const filtreCategorie = document.querySelector("#filtre-categorie-produits");
const dialogProduit = document.querySelector("#dialog-produit");
const formProduit = document.querySelector("#form-produit");
const apercuImage = document.querySelector("#apercu-image");
let idProduitEdite = null;

// Listes de catégories (filtre + formulaire)
CATEGORIES.forEach((c) => {
  const option1 = creerElement("option", [], c.nom);
  option1.value = c.nom;
  filtreCategorie.appendChild(option1);
  const option2 = creerElement("option", [], c.nom);
  option2.value = c.nom;
  formProduit.elements.categorie.appendChild(option2);
});

async function chargerProduitsAdmin() {
  ligneVide(tbodyProduits, 5, "Chargement…");
  try {
    produitsAdmin = await api("/api/produits");
    afficherProduitsAdmin();
  } catch (erreur) {
    ligneVide(tbodyProduits, 5, erreur.message);
  }
}

function afficherProduitsAdmin() {
  const recherche = rechercheProduits.value.trim().toLowerCase();
  const categorie = filtreCategorie.value;
  const liste = produitsAdmin.filter((p) =>
    p.nom.toLowerCase().includes(recherche) && (!categorie || p.categorie === categorie));

  document.querySelector("#compteur-produits").textContent = produitsAdmin.length + " produit(s) au catalogue";
  if (liste.length === 0) return ligneVide(tbodyProduits, 5, "Aucun produit.");

  tbodyProduits.textContent = "";
  liste.forEach((p) => {
    tbodyProduits.appendChild(ligneTableau([
      cellule(cellulePrincipale(p.image, p.nom, p.description.slice(0, 50) + (p.description.length > 50 ? "…" : ""))),
      p.categorie,
      cellule(formaterPrix(p.prix), ["nowrap"]),
      p.vedette ? "Oui" : "—",
      groupeActions(
        boutonAction("Modifier", () => ouvrirFormProduit(p)),
        boutonAction("Supprimer", () => confirmerEtSupprimer(
          `Supprimer le produit « ${p.nom} » ?`, "/api/produits/" + p.id, chargerProduitsAdmin), true)
      )
    ]));
  });
}

function ouvrirFormProduit(produit = null) {
  idProduitEdite = produit ? produit.id : null;
  document.querySelector("#titre-form-produit").textContent = produit ? "Modifier le produit" : "Nouveau produit";
  document.querySelector("#erreur-form-produit").textContent = "";
  remplirFormulaire(formProduit, produit || { categorie: CATEGORIES[0].nom, image: "images/placeholder.svg" });
  apercuImage.src = formProduit.elements.image.value || "images/placeholder.svg";
  dialogProduit.showModal();
}

formProduit.elements.image.addEventListener("input", (e) => {
  apercuImage.src = e.target.value.trim() || "images/placeholder.svg";
});
apercuImage.addEventListener("error", () => { apercuImage.src = "images/placeholder.svg"; });

formProduit.addEventListener("submit", async (evenement) => {
  evenement.preventDefault();
  const donnees = lireFormulaire(formProduit);
  if (!donnees.image) delete donnees.image;
  try {
    if (idProduitEdite) await api("/api/produits/" + idProduitEdite, { method: "PUT", body: donnees });
    else await api("/api/produits", { method: "POST", body: donnees });
    dialogProduit.close();
    afficherToast(idProduitEdite ? "Produit modifié" : "Produit ajouté");
    chargerProduitsAdmin();
  } catch (erreur) {
    document.querySelector("#erreur-form-produit").textContent = erreur.message;
  }
});

document.querySelector("#btn-nouveau-produit").addEventListener("click", () => ouvrirFormProduit());
rechercheProduits.addEventListener("input", afficherProduitsAdmin);
filtreCategorie.addEventListener("change", afficherProduitsAdmin);

/* =========================================================
   6. COMMANDES — consulter, changer le statut, supprimer
   ========================================================= */
const tbodyCommandes = document.querySelector("#tbody-commandes");
const filtreStatut = document.querySelector("#filtre-statut");

STATUTS.forEach((s) => {
  const option = creerElement("option", [], s.charAt(0).toUpperCase() + s.slice(1));
  option.value = s;
  filtreStatut.appendChild(option);
});

async function chargerCommandes() {
  ligneVide(tbodyCommandes, 7, "Chargement…");
  try {
    const statut = filtreStatut.value;
    const commandes = await api("/api/commandes" + (statut ? "?statut=" + encodeURIComponent(statut) : ""));
    document.querySelector("#compteur-commandes").textContent = commandes.length + " commande(s)";
    if (commandes.length === 0) return ligneVide(tbodyCommandes, 7, "Aucune commande.");

    tbodyCommandes.textContent = "";
    commandes.forEach((c) => {
      tbodyCommandes.appendChild(ligneTableau([
        cellule(c.numero, ["nowrap"]),
        cellule(dateCourte(c.createdAt), ["nowrap"]),
        c.client.nom,
        c.client.ville,
        cellule(formaterPrix(c.total), ["nowrap"]),
        cellule(selectStatut(c)),
        groupeActions(
          boutonAction("Détails", () => afficherDetailsCommande(c)),
          boutonAction("Supprimer", () => confirmerEtSupprimer(
            `Supprimer la commande ${c.numero} ?`, "/api/commandes/" + c.id, chargerCommandes), true)
        )
      ]));
    });
  } catch (erreur) {
    ligneVide(tbodyCommandes, 7, erreur.message);
  }
}

// Liste déroulante qui modifie directement le statut (PUT /api/commandes/:id)
function selectStatut(commande) {
  const select = creerElement("select", ["champ", "select-statut"]);
  STATUTS.forEach((s) => {
    const option = creerElement("option", [], s);
    option.value = s;
    option.selected = s === commande.statut;
    select.appendChild(option);
  });
  select.addEventListener("change", async () => {
    try {
      await api("/api/commandes/" + commande.id, { method: "PUT", body: { statut: select.value } });
      commande.statut = select.value;
      afficherToast(`${commande.numero} : ${select.value}`);
    } catch (erreur) {
      select.value = commande.statut;
      afficherToast(erreur.message, "erreur");
    }
  });
  return select;
}

function afficherDetailsCommande(c) {
  const zone = document.querySelector("#contenu-details");
  zone.textContent = "";
  zone.appendChild(creerElement("h2", [], "Commande " + c.numero));
  zone.appendChild(badgeStatut(c.statut));

  const grille = creerElement("div", ["details-grille"]);
  [["Client", c.client.nom], ["Téléphone", c.client.telephone], ["Adresse", c.client.adresse + ", " + c.client.ville],
   ["Paiement", c.paiement], ["Date", dateCourte(c.createdAt)], ["Code promo", c.codePromo || "—"]].forEach(([libelle, valeur]) => {
    const bloc = creerElement("div");
    bloc.appendChild(creerElement("span", [], libelle));
    bloc.appendChild(creerElement("strong", [], valeur));
    grille.appendChild(bloc);
  });
  zone.appendChild(grille);

  const recap = creerElement("div", ["modal__recap"]);
  const ajouterLigne = (gauche, droite, classes = []) => {
    const ligne = creerElement("div", ["recap-ligne", ...classes]);
    ligne.appendChild(creerElement("span", [], gauche));
    ligne.appendChild(creerElement("strong", [], droite));
    recap.appendChild(ligne);
  };
  c.lignes.forEach((l) => ajouterLigne(`${l.quantite} × ${l.nom} (${formaterPrix(l.prix)})`, formaterPrix(l.total)));
  ajouterLigne("Sous-total", formaterPrix(c.sousTotal), ["recap-ligne--total"]);
  if (c.remise) ajouterLigne("Remise", "− " + formaterPrix(c.remise));
  ajouterLigne("Livraison", c.livraison ? formaterPrix(c.livraison) : "Offerte");
  ajouterLigne("Total", formaterPrix(c.total), ["recap-ligne--total"]);
  zone.appendChild(recap);

  document.querySelector("#dialog-details").showModal();
}

filtreStatut.addEventListener("change", chargerCommandes);

/* =========================================================
   7. ARTICLES DU BLOG — CRUD complet
   ========================================================= */
const tbodyArticles = document.querySelector("#tbody-articles");
const dialogArticle = document.querySelector("#dialog-article");
const formArticle = document.querySelector("#form-article");
let idArticleEdite = null;

async function chargerArticles() {
  ligneVide(tbodyArticles, 5, "Chargement…");
  try {
    const articles = await api("/api/articles?tous=true");
    document.querySelector("#compteur-articles").textContent = articles.length + " article(s)";
    if (articles.length === 0) return ligneVide(tbodyArticles, 5, "Aucun article. Créez le premier !");

    tbodyArticles.textContent = "";
    articles.forEach((a) => {
      const voir = creerElement("a", ["btn-action"], "Voir");
      voir.href = "article.html?id=" + a.id;
      voir.target = "_blank";
      tbodyArticles.appendChild(ligneTableau([
        cellule(cellulePrincipale(a.image, a.titre, a.resume.slice(0, 60) + (a.resume.length > 60 ? "…" : ""))),
        a.auteur,
        cellule(formaterDate(a.createdAt), ["nowrap"]),
        cellule(badgeStatut(a.publie ? "publié" : "brouillon")),
        groupeActions(
          voir,
          boutonAction("Modifier", () => ouvrirFormArticle(a)),
          boutonAction("Supprimer", () => confirmerEtSupprimer(
            `Supprimer l'article « ${a.titre} » ?`, "/api/articles/" + a.id, chargerArticles), true)
        )
      ]));
    });
  } catch (erreur) {
    ligneVide(tbodyArticles, 5, erreur.message);
  }
}

function ouvrirFormArticle(article = null) {
  idArticleEdite = article ? article.id : null;
  document.querySelector("#titre-form-article").textContent = article ? "Modifier l'article" : "Nouvel article";
  document.querySelector("#erreur-form-article").textContent = "";
  remplirFormulaire(formArticle, article || { publie: true });
  dialogArticle.showModal();
}

formArticle.addEventListener("submit", async (evenement) => {
  evenement.preventDefault();
  const donnees = lireFormulaire(formArticle);
  if (!donnees.auteur) delete donnees.auteur;
  if (!donnees.image) delete donnees.image;
  try {
    if (idArticleEdite) await api("/api/articles/" + idArticleEdite, { method: "PUT", body: donnees });
    else await api("/api/articles", { method: "POST", body: donnees });
    dialogArticle.close();
    afficherToast(idArticleEdite ? "Article modifié" : "Article publié");
    chargerArticles();
  } catch (erreur) {
    document.querySelector("#erreur-form-article").textContent = erreur.message;
  }
});

document.querySelector("#btn-nouvel-article").addEventListener("click", () => ouvrirFormArticle());

/* =========================================================
   8. MESSAGES DE CONTACT — consulter, marquer lu, supprimer
   ========================================================= */
const tbodyMessages = document.querySelector("#tbody-messages");
const filtreMessages = document.querySelector("#filtre-messages");

async function chargerMessages() {
  ligneVide(tbodyMessages, 5, "Chargement…");
  try {
    const filtre = filtreMessages.value;
    const messages = await api("/api/messages" + (filtre ? "?lu=" + filtre : ""));
    const nonLus = messages.filter((m) => !m.lu).length;
    document.querySelector("#compteur-messages").textContent = messages.length + " message(s)" + (nonLus ? ` · ${nonLus} non lu(s)` : "");
    if (!filtre) majPastilleMessages(nonLus);
    if (messages.length === 0) return ligneVide(tbodyMessages, 5, "Aucun message.");

    tbodyMessages.textContent = "";
    messages.forEach((m) => {
      const expediteur = creerElement("div");
      expediteur.appendChild(creerElement("div", [], m.nom));
      expediteur.appendChild(creerElement("small", ["texte-discret"], m.email));
      tbodyMessages.appendChild(ligneTableau([
        cellule(m.lu ? "" : creerElement("span", ["point"])),
        cellule(expediteur),
        m.sujet,
        cellule(dateCourte(m.createdAt), ["nowrap"]),
        groupeActions(
          boutonAction("Lire", () => lireMessage(m)),
          boutonAction(m.lu ? "Marquer non lu" : "Marquer lu", () => changerEtatMessage(m, !m.lu)),
          boutonAction("Supprimer", () => confirmerEtSupprimer(
            `Supprimer le message de ${m.nom} ?`, "/api/messages/" + m.id, chargerMessages), true)
        )
      ], m.lu ? [] : ["non-lu"]));
    });
  } catch (erreur) {
    ligneVide(tbodyMessages, 5, erreur.message);
  }
}

async function changerEtatMessage(message, lu) {
  try {
    await api("/api/messages/" + message.id, { method: "PUT", body: { lu } });
    chargerMessages();
  } catch (erreur) {
    afficherToast(erreur.message, "erreur");
  }
}

function lireMessage(m) {
  const zone = document.querySelector("#contenu-details");
  zone.textContent = "";
  zone.appendChild(creerElement("h2", [], m.sujet));
  const grille = creerElement("div", ["details-grille"]);
  [["De", m.nom], ["Email", m.email], ["Reçu le", dateCourte(m.createdAt)]].forEach(([libelle, valeur]) => {
    const bloc = creerElement("div");
    bloc.appendChild(creerElement("span", [], libelle));
    bloc.appendChild(creerElement("strong", [], valeur));
    grille.appendChild(bloc);
  });
  zone.appendChild(grille);
  zone.appendChild(creerElement("div", ["details-message"], m.message));
  const repondre = creerElement("a", ["btn", "btn-outline", "btn-sm"]);
  contenuAvecIcone(repondre, "email", "Répondre par email");
  repondre.href = "mailto:" + encodeURIComponent(m.email) + "?subject=" + encodeURIComponent("Re : " + m.sujet);
  repondre.style.marginTop = "1rem";
  zone.appendChild(repondre);
  document.querySelector("#dialog-details").showModal();

  if (!m.lu) changerEtatMessage(m, true); // ouvrir un message le marque comme lu
}

filtreMessages.addEventListener("change", chargerMessages);

/* =========================================================
   DÉMARRAGE
   ========================================================= */
if (sessionStorage.getItem("mbote_admin") === "ok") ouvrirDashboard();
