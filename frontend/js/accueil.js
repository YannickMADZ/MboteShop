/* =========================================================
   accueil.js — Page d'accueil : catégories + produits vedettes + blog
   ========================================================= */

const zoneCategories = document.querySelector("#categories");
const zoneVedettes = document.querySelector("#produits-vedettes");
const zoneArticles = document.querySelector("#derniers-articles");

function afficherCategories() {
  CATEGORIES.forEach((categorie) => {
    const nombre = PRODUITS.filter((p) => p.categorie === categorie.nom).length;

    const carte = creerElement("a", ["categorie-carte"]);
    carte.href = "produits.html?categorie=" + encodeURIComponent(categorie.nom);
    const image = document.createElement("img");
    image.src = categorie.image;
    image.alt = "";
    image.loading = "lazy";
    image.addEventListener("error", () => { image.src = "images/placeholder.svg"; }, { once: true });
    const texte = creerElement("div", ["categorie-carte__texte"]);
    texte.appendChild(creerElement("strong", [], categorie.nom));
    texte.appendChild(creerElement("span", [], nombre + " produit" + (nombre > 1 ? "s" : "")));
    carte.appendChild(image);
    carte.appendChild(texte);

    zoneCategories.appendChild(carte);
  });
}

function afficherVedettes() {
  zoneVedettes.textContent = "";
  let vedettes = PRODUITS.filter((produit) => produit.vedette);
  if (vedettes.length === 0) vedettes = PRODUITS; // aucun produit vedette -> les premiers
  vedettes.slice(0, 4).forEach((produit) => zoneVedettes.appendChild(creerCarteProduit(produit)));
}

async function afficherDerniersArticles() {
  try {
    const articles = await api("/api/articles");
    zoneArticles.textContent = "";
    articles.slice(0, 3).forEach((article) => zoneArticles.appendChild(creerCarteArticle(article)));
    if (articles.length === 0) zoneArticles.closest(".section").classList.add("cache");
  } catch (erreur) {
    zoneArticles.closest(".section").classList.add("cache");
  }
}

async function demarrer() {
  afficherChargement(zoneVedettes, "Chargement des produits…");
  try {
    await chargerProduits();
    afficherCategories();
    afficherVedettes();
  } catch (erreur) {
    afficherErreur(zoneVedettes, erreur);
  }
  afficherDerniersArticles();
}

demarrer();
