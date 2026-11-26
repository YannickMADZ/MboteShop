/* =========================================================
   produits.js — Liste des produits, recherche, filtre et tri
   ========================================================= */

const grille = document.querySelector("#grille-produits");
const champRecherche = document.querySelector("#recherche");
const zoneFiltres = document.querySelector("#filtres-categories");
const selectTri = document.querySelector("#tri");
const infoResultats = document.querySelector("#resultats-info");
const messageAucun = document.querySelector("#aucun-resultat");
const boutonReinitialiser = document.querySelector("#reinitialiser");

// État courant des filtres
const etat = { recherche: "", categorie: "Toutes", tri: "defaut" };

// Catégorie reçue dans l'URL (ex : produits.html?categorie=Chaussures)
const categorieURL = new URLSearchParams(window.location.search).get("categorie");
if (CATEGORIES.some((c) => c.nom === categorieURL)) {
  etat.categorie = categorieURL;
}

// Supprime les accents et met en minuscules : "Électronique" -> "electronique"
function normaliser(texte) {
  return texte.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function creerFiltresCategories() {
  const noms = ["Toutes", ...CATEGORIES.map((c) => c.nom)];

  noms.forEach((nom) => {
    const chip = creerElement("button", ["chip"], nom);
    chip.type = "button";
    chip.dataset.categorie = nom;
    if (nom === etat.categorie) chip.classList.add("actif");

    chip.addEventListener("click", () => {
      etat.categorie = nom;
      document.querySelectorAll(".chip").forEach((c) => {
        c.classList.toggle("actif", c.dataset.categorie === nom);
      });
      afficherProduits();
    });

    zoneFiltres.appendChild(chip);
  });
}

function filtrerEtTrier() {
  const recherche = normaliser(etat.recherche);

  let liste = PRODUITS.filter((produit) => {
    const correspondNom = normaliser(produit.nom).includes(recherche);
    const correspondCategorie = etat.categorie === "Toutes" || produit.categorie === etat.categorie;
    return correspondNom && correspondCategorie;
  });

  if (etat.tri === "prix-croissant") liste = [...liste].sort((a, b) => a.prix - b.prix);
  if (etat.tri === "prix-decroissant") liste = [...liste].sort((a, b) => b.prix - a.prix);
  if (etat.tri === "nom") liste = [...liste].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  return liste;
}

function afficherProduits() {
  const liste = filtrerEtTrier();

  grille.textContent = ""; // on vide la grille avant de la reconstruire
  liste.forEach((produit) => grille.appendChild(creerCarteProduit(produit)));

  infoResultats.textContent = liste.length + (liste.length > 1 ? " produits trouvés" : " produit trouvé");
  messageAucun.classList.toggle("cache", liste.length > 0);
}

/* ---------- Événements ---------- */
champRecherche.addEventListener("input", (evenement) => {
  etat.recherche = evenement.target.value.trim();
  afficherProduits();
});

selectTri.addEventListener("change", (evenement) => {
  etat.tri = evenement.target.value;
  afficherProduits();
});

boutonReinitialiser.addEventListener("click", () => {
  etat.recherche = "";
  etat.categorie = "Toutes";
  champRecherche.value = "";
  document.querySelectorAll(".chip").forEach((c) => {
    c.classList.toggle("actif", c.dataset.categorie === "Toutes");
  });
  afficherProduits();
});

/* ---------- Démarrage : chargement des produits depuis l'API ---------- */
async function demarrer() {
  creerFiltresCategories();
  afficherChargement(grille, "Chargement des produits…");
  try {
    await chargerProduits();   // GET /api/produits
    afficherProduits();
  } catch (erreur) {
    infoResultats.textContent = "";
    afficherErreur(grille, erreur);
  }
}

demarrer();
