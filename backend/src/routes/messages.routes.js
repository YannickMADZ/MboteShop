const express = require("express");
const controleur = require("../controllers/messages.controller");

const routeur = express.Router();

routeur.get("/", controleur.lister);
routeur.get("/:id", controleur.obtenir);
routeur.post("/", controleur.creer);
routeur.put("/:id", controleur.modifier);
routeur.delete("/:id", controleur.supprimer);

module.exports = routeur;
