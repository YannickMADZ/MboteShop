/* =========================================================
   app.js — Configuration de l'application Express
   ========================================================= */
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const gestionErreurs = require("./middlewares/gestionErreurs");

const app = express();

/* ---------- Middlewares globaux ---------- */
app.use(cors());                          // autorise un frontend hébergé ailleurs (GitHub Pages, Vercel…)
app.use(express.json({ limit: "1mb" }));  // lit le corps JSON des requêtes

// Journal simple des requêtes de l'API
app.use("/api", (req, res, next) => {
  const debut = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - debut} ms)`);
  });
  next();
});

/* ---------- Routes de l'API REST ---------- */
app.get("/api/sante", (req, res) => {
  res.json({
    statut: "ok",
    baseDeDonnees: mongoose.connection.readyState === 1 ? "connectée" : "déconnectée"
  });
});

app.use("/api/produits", require("./routes/produits.routes"));
app.use("/api/commandes", require("./routes/commandes.routes"));
app.use("/api/articles", require("./routes/articles.routes"));
app.use("/api/messages", require("./routes/messages.routes"));
app.use("/api/stats", require("./routes/stats.routes"));

// Route d'API inconnue
app.use("/api", (req, res) => {
  res.status(404).json({ message: `Route introuvable : ${req.method} ${req.originalUrl}` });
});

/* ---------- Frontend (fichiers statiques) ----------
   Le même serveur sert la boutique et le dashboard : une seule URL Render. */
const dossierFrontend = process.env.FRONTEND_DIR || path.join(__dirname, "..", "..", "frontend");
app.use(express.static(dossierFrontend));

/* ---------- Gestion centralisée des erreurs ---------- */
app.use(gestionErreurs);

module.exports = app;
