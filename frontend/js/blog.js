/* =========================================================
   blog.js — Liste des articles publiés (GET /api/articles)
   ========================================================= */

const grilleArticles = document.querySelector("#grille-articles");
const blogVide = document.querySelector("#blog-vide");

async function afficherArticles() {
  afficherChargement(grilleArticles, "Chargement des articles…");
  try {
    const articles = await api("/api/articles");
    grilleArticles.textContent = "";
    blogVide.classList.toggle("cache", articles.length > 0);
    articles.forEach((article) => grilleArticles.appendChild(creerCarteArticle(article)));
  } catch (erreur) {
    afficherErreur(grilleArticles, erreur);
  }
}

afficherArticles();
