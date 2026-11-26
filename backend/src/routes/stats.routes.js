const express = require("express");
const controleur = require("../controllers/stats.controller");

const routeur = express.Router();
routeur.get("/", controleur.obtenir);

module.exports = routeur;
