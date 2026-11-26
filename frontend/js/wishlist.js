/* =========================================================
   wishlist.js — Affichage et gestion des favoris
   ========================================================= */

const grilleWishlist = document.querySelector("#grille-wishlist");
const wishlistVide = document.querySelector("#wishlist-vide");
const compteurWishlist = document.querySelector("#wishlist-compteur");
const boutonToutAjouter = document.querySelector("#tout-ajouter");

function afficherWishlist() {
  const ids = getWishlist();
  const vide = ids.length === 0;

  grilleWishlist.textContent = "";
  wishlistVide.classList.toggle("cache", !vide);
  boutonToutAjouter.classList.toggle("cache", vide);
  compteurWishlist.textContent = vide
    ? "Ajoutez des produits en cliquant sur « Favoris »."
    : ids.length + (ids.length > 1 ? " produits enregistrés" : " produit enregistré");

  ids.forEach((id) => {
    const produit = trouverProduit(id);
    const carte = creerCarteProduit(produit);

    // On remplace les actions par défaut par "Ajouter au panier" + "Retirer"
    const actions = carte.querySelector(".carte-produit__actions");
    actions.textContent = "";
    actions.appendChild(creerBoutonPanier(id));

    const boutonRetirer = creerElement("button", ["btn", "btn-outline", "btn-sm", "btn-retirer"], "Retirer");
    boutonRetirer.type = "button";
    boutonRetirer.addEventListener("click", () => {
      retirerFavori(id);
      afficherWishlist();
    });
    actions.appendChild(boutonRetirer);

    grilleWishlist.appendChild(carte);
  });
}

boutonToutAjouter.addEventListener("click", () => {
  const ids = getWishlist();
  ids.forEach((id) => ajouterAuPanier(id, 1, true));
  animerBadge("#badge-panier");
  afficherToast(ids.length + " produit(s) ajouté(s) au panier", "panier");
});

async function demarrer() {
  afficherChargement(grilleWishlist);
  try {
    await chargerProduits();
    afficherWishlist();
  } catch (erreur) {
    afficherErreur(grilleWishlist, erreur);
  }
}

demarrer();
