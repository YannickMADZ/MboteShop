# MbotéShop — Boutique en ligne full-stack

Frontend **HTML / CSS / JavaScript DOM** (sans framework) + backend **Node.js / Express** + base **MongoDB**.
Le même serveur Express sert l'API REST, la boutique et le dashboard : une seule URL à déployer sur Render.

```
Navigateur ──► Express (Render) ──► MongoDB Atlas
              ├── /            boutique (frontend/)
              ├── /admin.html  dashboard
              └── /api/...     API REST (JSON)
```

## Structure

```
ecommerce/
├── Dockerfile              Image unique (API + frontend)
├── docker-compose.yml      Lancement local : API + MongoDB
├── render.yaml             Déploiement Render (Blueprint)
├── .env.example            Modèle pour la chaîne MongoDB Atlas
│
├── backend/
│   ├── server.js           Connexion MongoDB puis démarrage
│   └── src/
│       ├── app.js          Configuration Express (middlewares, routes, fichiers statiques)
│       ├── config/db.js    Connexion MongoDB (avec nouvelles tentatives)
│       ├── models/         Schémas Mongoose : Produit, Commande, Article, Message
│       ├── controllers/    Logique CRUD de chaque ressource + statistiques
│       ├── routes/         Définition des routes REST
│       ├── middlewares/    Gestion centralisée des erreurs
│       ├── utils/          Calcul des totaux (prix, promo, livraison), outils
│       └── seed/           Données de départ (14 produits, 3 articles)
│
└── frontend/
    ├── index.html  produits.html  produit.html  panier.html  wishlist.html
    ├── blog.html   article.html   contact.html
    ├── admin.html          Dashboard d'administration
    ├── css/  style.css  admin.css
    ├── js/   config.js (URL de l'API, code admin)  commun.js (fonction api(), panier, wishlist…)
    │         accueil.js produits.js produit.js panier.js wishlist.js blog.js article.js contact.js admin.js
    └── images/
```

## 1. Lancer en local avec Docker (sans Python ni Node sur la machine)

Prérequis : Docker Desktop.

```bash
cd ecommerce
docker compose up --build        # premier lancement (télécharge les images, ~1-2 min)
```

- Boutique : http://localhost:3000
- Dashboard : http://localhost:3000/admin.html (code : `mbote2026`)
- API : http://localhost:3000/api/produits

La base est remplie automatiquement au premier démarrage (14 produits, 3 articles).

```bash
docker compose logs -f api                       # voir les logs de l'API
docker compose up --build -d                     # relancer après une modification du code
docker compose exec api npm run seed:reset       # remettre les produits/articles de départ
docker compose down                              # arrêter (les données sont conservées)
docker compose down -v                           # arrêter ET effacer la base locale
```

**Connexion lente ou filtrée (le build bloque sur `npm ci`) :** utiliser la variante hors ligne. Les dépendances sont déjà fournies dans `backend/node_modules`, donc aucun téléchargement npm :

```bash
docker compose -f docker-compose.hors-ligne.yml up --build
```

(`backend/node_modules` est ignoré par Git : Render utilise toujours le `Dockerfile` normal et installe les dépendances lui-même.)

**Utiliser MongoDB Atlas en local :** copier `.env.example` en `.env`, mettre votre chaîne Atlas dans `MONGODB_URI`, puis `docker compose up --build`.

## 2. Créer la base MongoDB Atlas

1. Créer un compte sur https://www.mongodb.com/cloud/atlas puis un cluster gratuit **M0**.
2. **Database Access** → *Add New Database User* : un utilisateur + mot de passe (lecture/écriture).
3. **Network Access** → *Add IP Address* → `0.0.0.0/0` (obligatoire : Render n'a pas d'IP fixe en offre gratuite).
4. **Connect** → *Drivers* → copier la chaîne, remplacer `<password>` et ajouter le nom de la base :
   `mongodb+srv://user:motdepasse@cluster0.xxxxx.mongodb.net/mbote_shop?retryWrites=true&w=majority`

⚠️ Si le mot de passe contient `@ : / ? #`, il faut l'encoder (ex : `@` → `%40`).

## 3. Déployer sur Render

1. Pousser le projet sur GitHub (voir plus bas).
2. Sur https://render.com : **New +** → **Blueprint** → choisir le dépôt (Render lit `render.yaml`).
   *Ou* **New +** → **Web Service** → dépôt → Runtime **Docker**, plan **Free**.
3. Renseigner la variable d'environnement `MONGODB_URI` = chaîne Atlas.
4. Déployer. L'URL ressemble à `https://mbote-shop.onrender.com`. Tester `…/api/sante` :
   `{"statut":"ok","baseDeDonnees":"connectée"}`

En offre gratuite, le service s'endort après 15 min d'inactivité : la première requête peut prendre ~50 s (le site affiche « Chargement… »).

**Frontend hébergé ailleurs (GitHub Pages / Vercel) ?** Dans `frontend/js/config.js`, mettre `const API_URL = "https://mbote-shop.onrender.com";`. CORS est déjà activé côté serveur.

## 4. API REST

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/produits?categorie=&q=&tri=` | Liste (filtre, recherche, tri `prix-croissant`, `prix-decroissant`, `nom`) |
| GET | `/api/produits/:id` | Détail |
| POST | `/api/produits` | Créer |
| PUT | `/api/produits/:id` | Modifier |
| DELETE | `/api/produits/:id` | Supprimer |
| GET | `/api/commandes?statut=` | Liste des commandes |
| GET | `/api/commandes/:id` | Détail |
| POST | `/api/commandes` | Passer une commande (page panier) |
| PUT | `/api/commandes/:id` | Changer le statut |
| DELETE | `/api/commandes/:id` | Supprimer |
| GET | `/api/articles` (`?tous=true` pour les brouillons) | Articles du blog |
| GET / POST / PUT / DELETE | `/api/articles/:id` | CRUD des articles |
| POST | `/api/messages` | Envoyer un message (page contact) |
| GET | `/api/messages?lu=false` | Liste des messages |
| PUT | `/api/messages/:id` | Marquer lu / non lu |
| DELETE | `/api/messages/:id` | Supprimer |
| GET | `/api/stats` | Chiffres du dashboard |
| GET | `/api/sante` | État du serveur et de la base |

Codes de réponse : `200` OK · `201` créé · `400` données invalides (avec la liste des erreurs) · `404` introuvable · `500` erreur serveur.

Exemple de commande :

```json
POST /api/commandes
{
  "client": { "nom": "Grâce Mabiala", "telephone": "06 123 45 67", "adresse": "Rue Mbochis, Poto-Poto", "ville": "Brazzaville" },
  "paiement": "Mobile Money",
  "codePromo": "BIENVENUE10",
  "lignes": [{ "produit": "<id du produit>", "quantite": 2 }]
}
```

## 5. Dashboard (`/admin.html`)

- **Vue d'ensemble** : chiffre d'affaires, nombre de commandes, produits, messages non lus, dernières commandes.
- **Produits** : ajouter, modifier, supprimer, rechercher, filtrer par catégorie, aperçu de l'image.
- **Commandes** : liste, filtre par statut, changement de statut en direct, détail, suppression.
- **Blog** : créer, modifier, supprimer, publier ou garder en brouillon.
- **Messages** : lire (marque automatiquement comme lu), marquer lu/non lu, répondre par email, supprimer.

**Accès :** comme demandé, il n'y a pas d'authentification côté serveur. Une simple barrière demande un code (`ADMIN_CODE` dans `frontend/js/config.js`), mémorisé pour l'onglet avec `sessionStorage`. Ce n'est **pas** une vraie sécurité : n'importe qui connaissant l'URL de l'API peut l'appeler. Ce serait l'étape suivante (JWT, sessions).

## 6. Points à expliquer à la présentation

**Comment le frontend parle au backend ?** Toutes les requêtes passent par la fonction `api()` de `commun.js`, qui utilise `fetch()`, envoie et reçoit du JSON et transforme les erreurs du serveur en messages lisibles.

**Où sont stockés les produits ?** Dans la collection MongoDB `produits` (modèle `Produit.js`). Le frontend les charge avec `GET /api/produits`. Le panier et la wishlist restent dans le `localStorage` du navigateur et ne contiennent que les `id` et les quantités.

**Comment une commande est créée ?** La page panier envoie seulement les `id` et les quantités. Le serveur relit les **vrais prix** dans MongoDB, applique le code promo et les frais de livraison (`utils/tarifs.js`), puis enregistre la commande. Un client ne peut donc pas modifier un prix depuis son navigateur. Chaque ligne garde une copie du nom et du prix au moment de l'achat.

**Organisation du backend :** route → contrôleur → modèle. Les routes associent une URL à une fonction. Les contrôleurs contiennent la logique. Les modèles Mongoose définissent la forme des données et les règles de validation (messages en français). Le middleware `gestionErreurs` transforme toutes les erreurs en réponses JSON propres.

**Photos :** elles viennent d'[Unsplash](https://unsplash.com) (licence libre, usage commercial autorisé) et sont chargées directement depuis le CDN d'Unsplash ; la taille et le cadrage sont réglés dans l'URL (`?w=800&h=800&fit=crop`). Pour changer la photo d'un produit : dashboard → Produits → Modifier → champ Image (une URL ou un fichier placé dans `frontend/images/`). Au démarrage, le serveur remplace automatiquement les anciennes illustrations `.svg` des produits de départ par ces photos, sans toucher aux images modifiées depuis le dashboard.

**Codes promo de test :** `BIENVENUE10` (−10 %), `MBOTE5000` (−5 000 FCFA), `LIVRAISONOFFERTE`.
