/* =========================================================
   contact.js — Formulaire de contact (POST /api/messages)
   ========================================================= */

const formContact = document.querySelector("#form-contact");
const boutonEnvoyer = document.querySelector("#btn-envoyer");
const confirmation = document.querySelector("#contact-confirmation");

const REGLES_CONTACT = {
  nom: (v) => v.trim().length >= 2 || "Entrez votre nom.",
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Adresse email invalide.",
  message: (v) => v.trim().length >= 10 || "Votre message doit contenir au moins 10 caractères."
};

function validerChampContact(nom) {
  const champ = formContact.elements[nom];
  const resultat = REGLES_CONTACT[nom](champ.value);
  const valide = resultat === true;
  champ.classList.toggle("invalide", !valide);
  document.querySelector("#erreur-" + nom).textContent = valide ? "" : resultat;
  return valide;
}

Object.keys(REGLES_CONTACT).forEach((nom) => {
  formContact.elements[nom].addEventListener("input", () => validerChampContact(nom));
});

formContact.addEventListener("submit", async (evenement) => {
  evenement.preventDefault();

  const valide = Object.keys(REGLES_CONTACT).map(validerChampContact).every(Boolean);
  if (!valide) {
    formContact.querySelector(".invalide").focus();
    return;
  }

  const donnees = new FormData(formContact);
  boutonEnvoyer.disabled = true;
  boutonEnvoyer.textContent = "Envoi en cours…";

  try {
    await api("/api/messages", {
      method: "POST",
      body: {
        nom: donnees.get("nom"),
        email: donnees.get("email"),
        sujet: donnees.get("sujet") || "Sans sujet",
        message: donnees.get("message")
      }
    });
    formContact.reset();
    formContact.classList.add("cache");
    confirmation.classList.remove("cache");
  } catch (erreur) {
    afficherToast(erreur.message, "erreur");
  } finally {
    boutonEnvoyer.disabled = false;
    boutonEnvoyer.textContent = "Envoyer le message";
  }
});

document.querySelector("#nouveau-message").addEventListener("click", () => {
  confirmation.classList.add("cache");
  formContact.classList.remove("cache");
});
