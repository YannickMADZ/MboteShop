/* =========================================================
   article.js — Lecture d'un article (GET /api/articles/:id)
   ========================================================= */

const idArticle = new URLSearchParams(window.location.search).get("id");
const zoneArticle = document.querySelector("#article");

function afficherArticle(article) {
  document.title = article.titre + " — Blog MbotéShop";
  zoneArticle.textContent = "";

  const entete = creerElement("header", ["article__entete"]);
  const retour = creerElement("a", ["lien-fleche"], "← Tous les articles");
  retour.href = "blog.html";
  entete.appendChild(retour);
  entete.appendChild(creerElement("h1", [], article.titre));
  entete.appendChild(creerElement("p", ["article__meta"], "Par " + article.auteur + " · " + formaterDate(article.createdAt)));

  const image = document.createElement("img");
  image.classList.add("article__image");
  image.src = article.image;
  image.alt = "";
  image.addEventListener("error", () => { image.src = "images/placeholder.svg"; }, { once: true });

  // Le contenu est découpé en paragraphes (lignes vides) et inséré avec textContent :
  // aucun HTML injecté, donc pas de risque de faille XSS.
  const contenu = creerElement("div", ["article__contenu"]);
  if (article.resume) contenu.appendChild(creerElement("p", ["article__chapo"], article.resume));
  article.contenu.split(/\n\s*\n/).forEach((paragraphe) => {
    if (paragraphe.trim()) contenu.appendChild(creerElement("p", [], paragraphe.trim()));
  });

  zoneArticle.appendChild(entete);
  zoneArticle.appendChild(image);
  zoneArticle.appendChild(contenu);
}

function afficherIntrouvable() {
  zoneArticle.textContent = "";
  const bloc = creerElement("div", ["message-vide"]);
  const symbole = creerElement("span", ["emoji"]);
  symbole.appendChild(icone("document"));
  bloc.appendChild(symbole);
  bloc.appendChild(creerElement("p", [], "Cet article est introuvable."));
  const lien = creerElement("a", ["btn", "btn-primary"], "Voir le blog");
  lien.href = "blog.html";
  bloc.appendChild(lien);
  zoneArticle.appendChild(bloc);
}

async function demarrer() {
  if (!idArticle) return afficherIntrouvable();
  afficherChargement(zoneArticle);
  try {
    afficherArticle(await api("/api/articles/" + encodeURIComponent(idArticle)));
  } catch (erreur) {
    if (erreur.status === 404 || erreur.status === 400) afficherIntrouvable();
    else afficherErreur(zoneArticle, erreur);
  }
}

demarrer();
