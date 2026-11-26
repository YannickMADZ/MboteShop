/* =========================================================
   config.js — Réglages du frontend
   ========================================================= */

/* Adresse de l'API.
   - Laisser vide ("") quand le frontend est servi par le backend Express
     (cas de Docker en local et du déploiement Render) : même adresse.
   - Si le frontend est hébergé ailleurs (GitHub Pages, Vercel…),
     indiquer l'URL Render, par exemple :
     const API_URL = "https://mbote-shop.onrender.com";            */
const API_URL = "";

/* Code d'accès au dashboard (simple barrière, PAS une vraie sécurité :
   le TP demande explicitement de ne pas faire d'authentification serveur). */
const ADMIN_CODE = "mbote2026";
