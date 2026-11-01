// Aqui agafo les coses que necesitare principalment al codi
const formulari = document.getElementById("formulari-jugadors");
const nom1 = document.getElementById("nom-jugador1");
const nom2 = document.getElementById("nom-jugador2");
const missatge1 = document.getElementById("missatge-jugador1");
const missatge2 = document.getElementById("missatge-jugador2");
const campJugador2 = document.getElementById("camp-jugador2");
const radios = document.getElementsByName("num-jugadors");
const textPuntuacio = document.getElementById("puntuacio-alta");

// Expresio regular per filtrar nomes lletres sense accents, números i _
const REGEX_NOM = /^[A-Za-z0-9_]+$/;

// Color de fons segons el navegador
const COLORS = { Chrome: "#ffe9a8", Firefox: "#ffd0b0", Safari: "#bfe3ff", Edge: "#c4f0d4", Altres: "#e3d7f5" };

// Detectar navegador (Edge i Chrome abans de Safari perquè també el contenen)
let navegador = "Altres";
const ua = navigator.userAgent;
if (ua.indexOf("Edg") !== -1) navegador = "Edge";
else if (ua.indexOf("Firefox") !== -1) navegador = "Firefox";
else if (ua.indexOf("Chrome") !== -1) navegador = "Chrome";
else if (ua.indexOf("Safari") !== -1) navegador = "Safari";

// Objecte amb la informació, guardat al sessionStorage
const info = {
  idioma: navigator.language.substring(0, 2),
  navegador: navegador,
  url: window.location.href,
  colorFons: COLORS[navegador]
};
sessionStorage.setItem("infoNavegador", JSON.stringify(info));

// Mostrar la informació i el color de fons
document.getElementById("info-navegador").textContent = info.navegador;
document.getElementById("info-idioma").textContent = info.idioma;
document.getElementById("info-url").textContent = info.url;
document.body.style.backgroundColor = info.colorFons;

// Puntuació més alta (localStorage)
function mostrarPuntuacioAlta() {
  const nom = localStorage.getItem("millorNom");
  if (nom === null) {
    textPuntuacio.textContent = "No hi ha puntuació actual";
  } else {
    textPuntuacio.textContent = nom + " - " + localStorage.getItem("millorPunts") + " punts - " + localStorage.getItem("millorData");
  }
}
mostrarPuntuacioAlta();

// Valida un camp de nom i el pinta en verd o vermell. Retorna true si és correcte
function validarCamp(input, missatge) {
  let error = "";
  if (input.value === "") error = "Has d'informar el nom d'un jugador";
  else if (input.value.length < 4) error = "El nom ha de tenir més de 3 caràcters";
  else if (input.value.length > 14) error = "El nom ha de tenir menys de 15 caràcters";
  else if (!REGEX_NOM.test(input.value)) error = "Només es poden introduir lletres sense accents, números i _";
  else if (input === nom2 && input.value.toLowerCase() === nom1.value.toLowerCase()) error = "Els dos jugadors han de tenir noms diferents";

  if (error === "") {
    input.className = "correcte";
    missatge.className = "missatge ok";
    missatge.textContent = "Correcte";
  } else {
    input.className = "incorrecte";
    missatge.className = "missatge error";
    missatge.textContent = error;
  }
  return error === "";
}

// Esdeveniment change dels dos camps
nom1.addEventListener("change", function () { validarCamp(nom1, missatge1); });
nom2.addEventListener("change", function () { validarCamp(nom2, missatge2); });

// Radiobuttons per mostrar o amagar el jugador 2
for (let i = 0; i < radios.length; i++) {
  radios[i].addEventListener("change", function () {
    campJugador2.hidden = !radios[1].checked;
  });
}

// Botó per comencar la partida
formulari.addEventListener("submit", function (event) {
  event.preventDefault();

  const correcte1 = validarCamp(nom1, missatge1);
  let correcte2 = true;
  if (radios[1].checked) correcte2 = validarCamp(nom2, missatge2);
  if (!correcte1 || !correcte2) return; // si hi ha errors no avancem

  // Noms a les cookies, si és 1 jugador s'esborra la cookie del jugado 2
  document.cookie = "jugador1=" + nom1.value + "; path=/";
  if (radios[1].checked) document.cookie = "jugador2=" + nom2.value + "; path=/";
  else document.cookie = "jugador2=; path=/; max-age=0";

  window.location.href = "pages/joc.html";
});

// Botó per esborrar la puntuació
document.getElementById("boto-borrar").addEventListener("click", function () {
  if (confirm("Estàs segur que vols esborrar la informació de la puntuació?")) {
    localStorage.removeItem("millorNom");
    localStorage.removeItem("millorPunts");
    localStorage.removeItem("millorData");
    mostrarPuntuacioAlta();
  }
});
