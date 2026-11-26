/* =========================================================
   produit.js — Page détail d'un produit (produit.html?id=…)
   ========================================================= */

const idProduit = new URLSearchParams(window.location.search).get("id");

const zoneDetail = document.querySelector("#detail-produit");
const arianeNom = document.querySelector("#ariane-nom");
const sectionSimilaires = document.querySelector("#section-similaires");
const zoneSimilaires = document.querySelector("#produits-similaires");

function afficherIntrouvable() {
  zoneDetail.textContent = "";
  const message = creerElement("div", ["message-vide"]);
  const symbole = creerElement("span", ["emoji"]);
  symbole.appendChild(icone("question"));
  message.appendChild(symbole);
  message.appendChild(creerElement("p", [], "Ce produit est introuvable."));
  const lien = creerElement("a", ["btn", "btn-primary"], "Retour aux produits");
  lien.href = "produits.html";
  message.appendChild(lien);
  zoneDetail.appendChild(message);
  arianeNom.textContent = "Introuvable";
  sectionSimilaires.classList.add("cache");
}

function afficherDetail(produit) {
  document.title = produit.nom + " — MbotéShop";
  arianeNom.textContent = produit.nom;
  zoneDetail.textContent = "";

  const conteneur = creerElement("div", ["detail"]);

  // Image
  const blocImage = creerElement("div", ["detail__image"]);
  const image = document.createElement("img");
  image.src = produit.image;
  image.alt = produit.nom;
  blocImage.appendChild(image);

  // Informations
  const info = creerElement("div", ["detail__info"]);
  info.appendChild(creerElement("span", ["tag"], produit.categorie));
  info.appendChild(creerElement("h1", [], produit.nom));
  info.appendChild(creerElement("p", ["prix"], formaterPrix(produit.prix)));
  info.appendChild(creerElement("p", [], produit.description));

  // Sélecteur de quantité
  let quantite = 1;
  const selecteur = creerElement("div", ["quantite"]);
  const moins = creerElement("button", [], "−");
  const affichage = creerElement("span", [], "1");
  const plus = creerElement("button", [], "+");
  moins.type = plus.type = "button";
  moins.setAttribute("aria-label", "Diminuer la quantité");
  plus.setAttribute("aria-label", "Augmenter la quantité");
  moins.addEventListener("click", () => {
    if (quantite > 1) quantite--;
    affichage.textContent = quantite;
  });
  plus.addEventListener("click", () => {
    quantite++;
    affichage.textContent = quantite;
  });
  selecteur.appendChild(moins);
  selecteur.appendChild(affichage);
  selecteur.appendChild(plus);

  // Boutons d'achat
  const achat = creerElement("div", ["detail__achat"]);
  const boutonPanier = creerElement("button", ["btn", "btn-primary"]);
  boutonPanier.type = "button";
  contenuAvecIcone(boutonPanier, "panier", "Ajouter au panier");
  boutonPanier.addEventListener("click", () => {
    ajouterAuPanier(produit.id, quantite);
    boutonPanier.classList.add("ajoute");
    contenuAvecIcone(boutonPanier, "coche", "Ajouté");
    setTimeout(() => {
      boutonPanier.classList.remove("ajoute");
      contenuAvecIcone(boutonPanier, "panier", "Ajouter au panier");
    }, 1200);
  });
  const boutonFavori = creerBoutonFavori(produit.id);
  boutonFavori.classList.remove("btn-sm");

  achat.appendChild(selecteur);
  achat.appendChild(boutonPanier);
  achat.appendChild(boutonFavori);
  info.appendChild(achat);

  // Avantages
  const liste = creerElement("ul", ["avantages-liste"]);
  [["camion", "Livraison gratuite dès 100 000 FCFA"], ["billet", "Paiement à la livraison ou Mobile Money"], ["retour", "Retour possible sous 7 jours"]]
    .forEach(([nom, texte]) => {
      const element = creerElement("li");
      contenuAvecIcone(element, nom, texte);
      liste.appendChild(element);
    });
  info.appendChild(liste);

  conteneur.appendChild(blocImage);
  conteneur.appendChild(info);
  zoneDetail.appendChild(conteneur);

  // Produits similaires (même catégorie)
  const similaires = PRODUITS.filter((p) => p.categorie === produit.categorie && p.id !== produit.id).slice(0, 4);
  similaires.forEach((p) => zoneSimilaires.appendChild(creerCarteProduit(p)));
  sectionSimilaires.classList.toggle("cache", similaires.length === 0);
}

async function demarrer() {
  if (!idProduit) return afficherIntrouvable();
  afficherChargement(zoneDetail);
  try {
    await chargerProduits();                                     // pour le panier et les produits similaires
    const produit = await api("/api/produits/" + encodeURIComponent(idProduit)); // GET /api/produits/:id
    afficherDetail(produit);
  } catch (erreur) {
    if (erreur.status === 404 || erreur.status === 400) afficherIntrouvable();
    else afficherErreur(zoneDetail, erreur);
  }
}

demarrer();
