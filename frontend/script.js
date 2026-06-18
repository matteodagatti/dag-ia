// ============================================================
// Gère l'interaction : envoi de la question au backend,
// affichage de l'animation de convergence, la réponse,
// et l'historique des questions dans la barre latérale.
// ============================================================

// ⚠️ Une fois ton backend déployé en ligne, remplace cette adresse
// par l'URL réelle de ton serveur (ex: https://ton-backend.onrender.com)
const URL_BACKEND = "";

// Clé utilisée pour sauvegarder l'historique dans le navigateur (localStorage).
// Les données restent uniquement sur cet ordinateur, dans ce navigateur.
const CLE_HISTORIQUE = "dag-ia-historique";

const formulaire = document.getElementById("formulaire");
const champQuestion = document.getElementById("question");
const champFichier = document.getElementById("champ-fichier");
const boutonJoindre = document.getElementById("bouton-joindre");
const apercuFichier = document.getElementById("apercu-fichier");
const apercuFichierIcone = document.getElementById("apercu-fichier-icone");
const apercuFichierNom = document.getElementById("apercu-fichier-nom");
const boutonRetirerFichier = document.getElementById("bouton-retirer-fichier");
const boutonModifierImage = document.getElementById("bouton-modifier-image");
const zoneImageModifiee = document.getElementById("zone-image-modifiee");
const resultatImage = document.getElementById("resultat-image");
const commentaireImage = document.getElementById("commentaire-image");
const lienTelechargerImage = document.getElementById("lien-telecharger-image");
const boutonNouvelleImage = document.getElementById("bouton-nouvelle-image");

// Garde en mémoire le fichier actuellement sélectionné, en attendant l'envoi
let fichierSelectionne = null;
const boutonEnvoyer = document.getElementById("bouton-envoyer");
const zoneConvergence = document.getElementById("zone-convergence");
const zoneReponse = document.getElementById("zone-reponse");
const texteReponse = document.getElementById("texte-reponse");
const detailsSources = document.getElementById("details-sources");
const zoneErreur = document.getElementById("zone-erreur");
const texteErreur = document.getElementById("texte-erreur");
const boutonNouvelle = document.getElementById("bouton-nouvelle");
const listeHistorique = document.getElementById("liste-historique");
const boutonEffacerHistorique = document.getElementById("bouton-effacer-historique");

// Éléments liés aux projets
const boutonNouveauProjet = document.getElementById("bouton-nouveau-projet");
const listeProjets = document.getElementById("liste-projets");
const modalProjet = document.getElementById("modal-projet");
const formulaireProjet = document.getElementById("formulaire-projet");
const champNomProjet = document.getElementById("champ-nom-projet");
const boutonAnnulerProjet = document.getElementById("bouton-annuler-projet");

// Éléments liés au compte
const boutonCompte = document.getElementById("bouton-compte");
const compteAvatar = document.getElementById("compte-avatar");
const compteNomAffiche = document.getElementById("compte-nom-affiche");
const modalCompte = document.getElementById("modal-compte");
const formulaireCompte = document.getElementById("formulaire-compte");
const champNomCompte = document.getElementById("champ-nom-compte");
const champEmailCompte = document.getElementById("champ-email-compte");
const boutonFermerCompte = document.getElementById("bouton-fermer-compte");
const boutonDeconnexion = document.getElementById("bouton-deconnexion");

// Éléments liés à l'écran de connexion
const ecranConnexion = document.getElementById("ecran-connexion");
const contenuApplication = document.getElementById("contenu-application");
const formulaireConnexion = document.getElementById("formulaire-connexion");
const champNomConnexion = document.getElementById("champ-nom-connexion");
const champEmailConnexion = document.getElementById("champ-email-connexion");
const champMotDePasseConnexion = document.getElementById("champ-motdepasse-connexion");
const erreurConnexion = document.getElementById("erreur-connexion");

const CLE_PROJETS = "dag-ia-projets";
const CLE_COMPTE = "dag-ia-compte";
const CLE_MOT_DE_PASSE = "dag-ia-mot-de-passe";

// ------------------------------------------------------------
// Gestion de l'historique (stocké dans le navigateur)
// ------------------------------------------------------------
function chargerHistorique() {
  try {
    const brut = localStorage.getItem(CLE_HISTORIQUE);
    return brut ? JSON.parse(brut) : [];
  } catch {
    return [];
  }
}

function sauvegarderHistorique(historique) {
  try {
    localStorage.setItem(CLE_HISTORIQUE, JSON.stringify(historique));
  } catch {
    // Si le stockage est plein ou indisponible, on continue silencieusement
    // sans casser l'expérience : l'historique ne sera juste pas conservé.
  }
}

function ajouterAHistorique(question, reponse, sources) {
  const historique = chargerHistorique();
  historique.unshift({
    id: Date.now(),
    question,
    reponse,
    sources,
  });
  // On garde un historique raisonnable (50 entrées max) pour ne pas surcharger le navigateur
  sauvegarderHistorique(historique.slice(0, 50));
  afficherHistorique();
}

function afficherHistorique() {
  const historique = chargerHistorique();
  listeHistorique.innerHTML = "";

  if (historique.length === 0) {
    const item = document.createElement("li");
    item.className = "historique-vide";
    item.textContent = "Tes questions apparaîtront ici.";
    listeHistorique.appendChild(item);
    return;
  }

  historique.forEach((entree) => {
    const item = document.createElement("li");
    const bouton = document.createElement("button");
    bouton.className = "item-historique";
    bouton.textContent = entree.question;
    bouton.title = entree.question;
    bouton.addEventListener("click", () => afficherEntreeHistorique(entree));
    item.appendChild(bouton);
    listeHistorique.appendChild(item);
  });
}

function afficherEntreeHistorique(entree) {
  champQuestion.value = entree.question;
  texteReponse.textContent = entree.reponse;
  detailsSources.textContent = entree.sources || "";
  zoneErreur.classList.add("cachee");
  zoneConvergence.classList.add("cachee");
  zoneReponse.classList.remove("cachee");

  // Mise en évidence visuelle de l'élément actif dans la barre latérale
  document.querySelectorAll(".item-historique").forEach((bouton) => {
    bouton.classList.toggle("actif", bouton.textContent === entree.question);
  });
}

function effacerHistorique() {
  sauvegarderHistorique([]);
  afficherHistorique();
}

// ------------------------------------------------------------
// Gestion des projets (stockés dans le navigateur)
// ------------------------------------------------------------
function chargerProjets() {
  try {
    const brut = localStorage.getItem(CLE_PROJETS);
    return brut ? JSON.parse(brut) : [];
  } catch {
    return [];
  }
}

function sauvegarderProjets(projets) {
  try {
    localStorage.setItem(CLE_PROJETS, JSON.stringify(projets));
  } catch {
    // Stockage indisponible : on continue sans casser l'expérience
  }
}

function afficherProjets() {
  const projets = chargerProjets();
  listeProjets.innerHTML = "";

  if (projets.length === 0) {
    const item = document.createElement("li");
    item.className = "historique-vide";
    item.textContent = "Aucun projet pour l'instant.";
    listeProjets.appendChild(item);
    return;
  }

  projets.forEach((projet) => {
    const item = document.createElement("li");
    const bouton = document.createElement("button");
    bouton.className = "item-projet";
    bouton.title = projet.nom;
    bouton.innerHTML = `<span class="pastille-projet"></span><span>${projet.nom}</span>`;
    item.appendChild(bouton);
    listeProjets.appendChild(item);
  });
}

function ouvrirModalProjet() {
  champNomProjet.value = "";
  modalProjet.classList.remove("cachee");
  champNomProjet.focus();
}

function fermerModalProjet() {
  modalProjet.classList.add("cachee");
}

function creerProjet(event) {
  event.preventDefault();
  const nom = champNomProjet.value.trim();
  if (nom === "") return;

  const projets = chargerProjets();
  projets.unshift({ id: Date.now(), nom });
  sauvegarderProjets(projets);
  afficherProjets();
  fermerModalProjet();
}

// ------------------------------------------------------------
// Gestion du compte (stocké dans le navigateur, sans mot de passe)
// ------------------------------------------------------------
function chargerCompte() {
  try {
    const brut = localStorage.getItem(CLE_COMPTE);
    return brut ? JSON.parse(brut) : { nom: "", email: "" };
  } catch {
    return { nom: "", email: "" };
  }
}

function sauvegarderCompte(compte) {
  try {
    localStorage.setItem(CLE_COMPTE, JSON.stringify(compte));
  } catch {
    // Stockage indisponible : on continue sans casser l'expérience
  }
}

function afficherCompte() {
  const compte = chargerCompte();
  if (compte.nom) {
    compteNomAffiche.textContent = compte.nom;
    compteAvatar.textContent = compte.nom.charAt(0).toUpperCase();
  } else {
    compteNomAffiche.textContent = "Compte";
    compteAvatar.textContent = "?";
  }
}

function ouvrirModalCompte() {
  const compte = chargerCompte();
  champNomCompte.value = compte.nom || "";
  champEmailCompte.value = compte.email || "";
  modalCompte.classList.remove("cachee");
  champNomCompte.focus();
}

function fermerModalCompte() {
  modalCompte.classList.add("cachee");
}

function enregistrerCompte(event) {
  event.preventDefault();
  const compte = {
    nom: champNomCompte.value.trim(),
    email: champEmailCompte.value.trim(),
  };
  sauvegarderCompte(compte);
  afficherCompte();
  fermerModalCompte();
}

// ------------------------------------------------------------
// Écran de connexion : bloque l'accès à l'application tant
// qu'aucun compte (nom + email) n'est enregistré dans ce navigateur.
// ------------------------------------------------------------
function verifierConnexion() {
  const compte = chargerCompte();
  const motDePasse = chargerMotDePasse();
  if (compte.nom && compte.email && motDePasse) {
    ecranConnexion.classList.add("cachee");
    contenuApplication.classList.remove("cachee");
  } else {
    ecranConnexion.classList.remove("cachee");
    contenuApplication.classList.add("cachee");
  }
}

async function validerConnexion(event) {
  event.preventDefault();
  const compte = {
    nom: champNomConnexion.value.trim(),
    email: champEmailConnexion.value.trim(),
  };
  const motDePasse = champMotDePasseConnexion.value;
  if (!compte.nom || !compte.email || !motDePasse) return;

  erreurConnexion.classList.add("cachee");

  // On vérifie le mot de passe en l'envoyant au serveur avec une question de test minimale.
  // Si le serveur répond 401, le mot de passe est incorrect.
  try {
    const reponseTest = await fetch(`${URL_BACKEND}/api/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-mot-de-passe": motDePasse,
      },
      body: JSON.stringify({ question: "test de connexion" }),
    });

    if (reponseTest.status === 401) {
      erreurConnexion.textContent = "Mot de passe incorrect.";
      erreurConnexion.classList.remove("cachee");
      return;
    }

    if (!reponseTest.ok && reponseTest.status !== 200) {
      erreurConnexion.textContent = "Impossible de contacter le serveur. Réessaie plus tard.";
      erreurConnexion.classList.remove("cachee");
      return;
    }

    sauvegarderMotDePasse(motDePasse);
    sauvegarderCompte(compte);
    afficherCompte();
    verifierConnexion();
  } catch {
    erreurConnexion.textContent = "Impossible de contacter le serveur. Vérifie ta connexion.";
    erreurConnexion.classList.remove("cachee");
  }
}

function chargerMotDePasse() {
  try {
    return localStorage.getItem(CLE_MOT_DE_PASSE) || "";
  } catch {
    return "";
  }
}

function sauvegarderMotDePasse(motDePasse) {
  try {
    localStorage.setItem(CLE_MOT_DE_PASSE, motDePasse);
  } catch {
    // Stockage indisponible : on continue sans casser l'expérience
  }
}

function seDeconnecter() {
  sauvegarderCompte({ nom: "", email: "" });
  sauvegarderMotDePasse("");
  afficherCompte();
  fermerModalCompte();
  champNomConnexion.value = "";
  champEmailConnexion.value = "";
  champMotDePasseConnexion.value = "";
  verifierConnexion();
}


// ------------------------------------------------------------
// Gestion du fichier joint (image ou PDF) à la question
// ------------------------------------------------------------
function gererSelectionFichier(event) {
  const fichier = event.target.files[0];
  if (!fichier) return;

  const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo, doit correspondre à la limite côté serveur
  if (fichier.size > TAILLE_MAX) {
    alert("Ce fichier est trop volumineux (10 Mo maximum).");
    champFichier.value = "";
    return;
  }

  fichierSelectionne = fichier;
  apercuFichierNom.textContent = fichier.name;

  if (fichier.type.startsWith("image/")) {
    const lecteur = new FileReader();
    lecteur.onload = (e) => {
      apercuFichierIcone.style.backgroundImage = `url(${e.target.result})`;
    };
    lecteur.readAsDataURL(fichier);
    boutonModifierImage.classList.remove("cachee");
  } else {
    apercuFichierIcone.style.backgroundImage = "none";
    boutonModifierImage.classList.add("cachee");
  }

  apercuFichier.classList.remove("cachee");
}

function retirerFichier() {
  fichierSelectionne = null;
  champFichier.value = "";
  apercuFichierIcone.style.backgroundImage = "none";
  apercuFichier.classList.add("cachee");
  boutonModifierImage.classList.add("cachee");
}

// ------------------------------------------------------------
// Modification d'image : envoie l'image jointe + l'instruction texte
// du champ question vers la route dédiée, et affiche le résultat.
// ------------------------------------------------------------
async function lancerModificationImage() {
  const instruction = champQuestion.value.trim();
  if (!instruction) {
    alert("Décris la modification souhaitée dans le champ de texte (ex. : enlève le fond).");
    return;
  }
  if (!fichierSelectionne) return;

  zoneReponse.classList.add("cachee");
  zoneImageModifiee.classList.add("cachee");
  zoneErreur.classList.add("cachee");
  zoneConvergence.classList.remove("cachee");
  boutonEnvoyer.disabled = true;
  boutonModifierImage.disabled = true;

  try {
    const donneesFormulaire = new FormData();
    donneesFormulaire.append("instruction", instruction);
    donneesFormulaire.append("fichier", fichierSelectionne);

    const reponseServeur = await fetch(`${URL_BACKEND}/api/modifier-image`, {
      method: "POST",
      headers: {
        "x-mot-de-passe": chargerMotDePasse(),
      },
      body: donneesFormulaire,
    });

    if (!reponseServeur.ok) {
      const erreurData = await reponseServeur.json().catch(() => ({}));
      throw new Error(erreurData.erreur || "Le serveur a renvoyé une erreur.");
    }

    const data = await reponseServeur.json();
    const urlImage = `data:${data.mimeType};base64,${data.image}`;

    resultatImage.src = urlImage;
    commentaireImage.textContent = data.commentaire || "";
    lienTelechargerImage.href = urlImage;

    zoneImageModifiee.classList.remove("cachee");
    retirerFichier();
  } catch (erreur) {
    console.error(erreur);
    texteErreur.textContent = erreur.message || "Impossible de modifier cette image.";
    zoneErreur.classList.remove("cachee");
  } finally {
    zoneConvergence.classList.add("cachee");
    boutonEnvoyer.disabled = false;
    boutonModifierImage.disabled = false;
  }
}

function nouvelleImage() {
  zoneImageModifiee.classList.add("cachee");
  champQuestion.value = "";
  champQuestion.focus();
}

async function poserLaQuestion(event) {
  event.preventDefault();
  const question = champQuestion.value.trim();
  if (question === "") return;

  zoneReponse.classList.add("cachee");
  zoneErreur.classList.add("cachee");
  zoneConvergence.classList.remove("cachee");
  boutonEnvoyer.disabled = true;

  try {
    // On utilise FormData (et non JSON) car ce format permet d'inclure
    // un fichier en plus du texte de la question.
    const donneesFormulaire = new FormData();
    donneesFormulaire.append("question", question);
    if (fichierSelectionne) {
      donneesFormulaire.append("fichier", fichierSelectionne);
    }

    const reponseServeur = await fetch(`${URL_BACKEND}/api/ask`, {
      method: "POST",
      headers: {
        "x-mot-de-passe": chargerMotDePasse(),
      },
      body: donneesFormulaire,
    });

    if (!reponseServeur.ok) {
      throw new Error("Le serveur a renvoyé une erreur.");
    }

    const data = await reponseServeur.json();

    texteReponse.textContent = data.reponse;

    const sourcesOk = data.details
      .filter((d) => d.aRepondu)
      .map((d) => d.nom)
      .join(" · ");
    detailsSources.textContent = sourcesOk || "";

    zoneReponse.classList.remove("cachee");

    ajouterAHistorique(question, data.reponse, sourcesOk);
    retirerFichier();
  } catch (erreur) {
    console.error(erreur);
    texteErreur.textContent =
      "Une erreur est survenue. Vérifie que le backend est bien lancé et accessible.";
    zoneErreur.classList.remove("cachee");
  } finally {
    zoneConvergence.classList.add("cachee");
    boutonEnvoyer.disabled = false;
  }
}

function nouvelleQuestion() {
  zoneReponse.classList.add("cachee");
  champQuestion.value = "";
  champQuestion.focus();
  retirerFichier();
  document.querySelectorAll(".item-historique").forEach((b) => b.classList.remove("actif"));
}

formulaire.addEventListener("submit", poserLaQuestion);
boutonNouvelle.addEventListener("click", nouvelleQuestion);
boutonEffacerHistorique.addEventListener("click", effacerHistorique);
boutonJoindre.addEventListener("click", () => champFichier.click());
champFichier.addEventListener("change", gererSelectionFichier);
boutonRetirerFichier.addEventListener("click", retirerFichier);
boutonModifierImage.addEventListener("click", lancerModificationImage);
boutonNouvelleImage.addEventListener("click", nouvelleImage);

// Projets
boutonNouveauProjet.addEventListener("click", ouvrirModalProjet);
boutonAnnulerProjet.addEventListener("click", fermerModalProjet);
formulaireProjet.addEventListener("submit", creerProjet);
modalProjet.addEventListener("click", (event) => {
  if (event.target === modalProjet) fermerModalProjet();
});

// Compte
boutonCompte.addEventListener("click", ouvrirModalCompte);
boutonFermerCompte.addEventListener("click", fermerModalCompte);
boutonDeconnexion.addEventListener("click", seDeconnecter);
formulaireCompte.addEventListener("submit", enregistrerCompte);
modalCompte.addEventListener("click", (event) => {
  if (event.target === modalCompte) fermerModalCompte();
});

// Connexion
formulaireConnexion.addEventListener("submit", validerConnexion);
boutonDeconnexion.addEventListener("click", seDeconnecter);

// Fermer les modals avec la touche Échap
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    fermerModalProjet();
    fermerModalCompte();
  }
});

// Ctrl/Cmd + Entrée pour envoyer sans cliquer sur le bouton
champQuestion.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    formulaire.requestSubmit();
  }
});

// Affichage initial dès le chargement de la page
afficherHistorique();
afficherProjets();
afficherCompte();
verifierConnexion();
