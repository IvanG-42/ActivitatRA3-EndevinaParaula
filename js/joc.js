// Llistes de lletres per idioma
const LLETRES_EN = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
  'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
  'y', 'z'];
const LLETRES_ESP = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
  'j', 'k', 'l', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
  'w', 'x', 'y', 'z'];
const LLETRES_CA = ['a', 'b', 'c', 'ç', 'd', 'e', 'f', 'g', 'h', 'i',
  'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w',
  'x', 'y', 'z'];
const MAX_ERRORS = 9;

// Elements de la pàgina
const inputParaula = document.getElementById("paraula-input");
const botoUll = document.getElementById("boto-ull");
const botoComencar = document.getElementById("boto-comencar-partida");
const paraulaSecreta = document.getElementById("paraula-secreta");
const imatgeGlobus = document.getElementById("imatge-globus");
const contenidorLletres = document.getElementById("botons-lletres");
const dialeg = document.getElementById("dialeg-error");

// Llegeix una cokie pel nom i retorna "" si no existei
function llegirCookie(nom) {
  const parts = document.cookie.split("; ");
  for (let i = 0; i < parts.length; i++) {
    const parella = parts[i].split("=");
    if (parella[0] === nom) return parella[1];
  }
  return "";
}

// Informació guardada a la pàgina inicial (sessionStorage)
const info = JSON.parse(sessionStorage.getItem("infoNavegador")) || { idioma: "ca", colorFons: "#d6ebf8" };
document.body.style.backgroundColor = info.colorFons;
document.getElementById("idioma-navegador").textContent = info.idioma;

// lletres segons l'idioma del buscador
let lletres = LLETRES_EN;
if (info.idioma === "ca") lletres = LLETRES_CA;
else if (info.idioma === "es") lletres = LLETRES_ESP;

// Array d'objectes amb els jugadors (noms llegits de les cookies)
function crearJugador(nom) {
  return { nom: nom, punts: 0, ratxa: 0, guanyades: 0, total: 0, millorPunts: 0, millorData: "" };
}
const jugadors = [crearJugador(llegirCookie("jugador1") || "Jugador1")];
if (llegirCookie("jugador2") !== "") {
  jugadors.push(crearJugador(llegirCookie("jugador2")));
  document.getElementById("targeta-jugador2").hidden = false;
}

// Variables de la partda
let torn = 0;               // jugador que té el torn
let lletresParaula = [];    // array amb les lletres de la paraula
let lletresMostrades = [];  // array amb "_" o la lletra encertada
let errors = 0;
let partidaActiva = false;

// canvis a les targetes de jugador (dades i color)
function actualitzarTargetes() {
  for (let i = 0; i < jugadors.length; i++) {
    const j = jugadors[i];
    const n = i + 1;
    let percentatge = 0;
    if (j.total > 0) percentatge = Math.round(j.guanyades * 100 / j.total);

    document.getElementById("nom-jugador-" + n).textContent = j.nom;
    document.getElementById("punts-actuals-" + n).textContent = j.punts;
    document.getElementById("total-partides-" + n).textContent = j.total;
    document.getElementById("partides-guanyades-" + n).textContent = j.guanyades + "(" + percentatge + "%)";
    if (j.millorPunts > 0) document.getElementById("partida-maxima-" + n).textContent = j.millorData + " - " + j.millorPunts + " punts";
    else document.getElementById("partida-maxima-" + n).textContent = "Sense punts";

    // canviar el color segons el torn del jugador (verd = té el torn, vermell = no juga)
    const targeta = document.getElementById("targeta-jugador" + n);
    targeta.classList.remove("torn-actiu", "torn-inactiu");
    if (partidaActiva && i === torn) targeta.classList.add("torn-actiu");
    else if (partidaActiva) targeta.classList.add("torn-inactiu");
  }
}

// ficar el titol el nom del jugador i les partides guanyades
function actualitzarTitol() {
  let titol = jugadors[0].nom + "(" + jugadors[0].guanyades + ")";
  if (jugadors.length === 2) titol += " - " + jugadors[1].nom + "(" + jugadors[1].guanyades + ")";
  document.title = titol;
}

// mostrar els quions i les lletres correctes
function mostrarParaula() {
  paraulaSecreta.textContent = lletresMostrades.join("");
}

// Crea els botons de les lletres amb createElement (deshabilitats al principi)
for (let i = 0; i < lletres.length; i++) {
  const boto = document.createElement("button");
  boto.type = "button";
  boto.textContent = lletres[i];
  boto.className = "lletra";
  boto.disabled = true;
  boto.addEventListener("click", function () { triarLletra(lletres[i], boto); });
  contenidorLletres.appendChild(boto);
}

// Botó "Començar partida"
document.getElementById("formulari-paraula").addEventListener("submit", function (event) {
  event.preventDefault();
  const text = inputParaula.value.trim().toLowerCase();

  // Validacions: es mostra el missatge en el diàleg
  let error = "";
  if (text === "") error = "Has d'afegir una paraula per poder començar a jugar";
  else if (/[0-9]/.test(text)) error = "La paraula no pot contenir números";
  else if (text.length < 4) error = "La paraula ha de contenir més de 3 caràcters";
  else {
    for (let i = 0; i < text.length; i++) {
      if (lletres.indexOf(text[i]) === -1) error = "La paraula només pot contenir lletres de l'abecedari del joc";
    }
  }
  if (error !== "") {
    document.getElementById("missatge-error").textContent = error;
    dialeg.showModal();
    return;
  }

  // Preparem la partida
  lletresParaula = text.split("");
  lletresMostrades = [];
  for (let i = 0; i < lletresParaula.length; i++) lletresMostrades.push("_");
  errors = 0;
  torn = 0;
  partidaActiva = true;
  for (let i = 0; i < jugadors.length; i++) {
    jugadors[i].punts = 0;
    jugadors[i].ratxa = 0;
  }

  // Input buit i deshabilitat (amagant la paraula), botó deshabilitat
  inputParaula.value = "";
  inputParaula.type = "password";
  botoUll.setAttribute("aria-pressed", "false");
  inputParaula.disabled = true;
  botoComencar.disabled = true;

  paraulaSecreta.classList.remove("guanyada", "perduda");
  mostrarParaula();
  imatgeGlobus.src = "../img/globus-0.png";
  for (let i = 0; i < contenidorLletres.children.length; i++) contenidorLletres.children[i].disabled = false;
  actualitzarTargetes();
});

// Quan es tria una lletra
function triarLletra(lletra, boto) {
  boto.disabled = true;

  // Posicions on apareix la lletra
  let aparicions = 0;
  for (let i = 0; i < lletresParaula.length; i++) {
    if (lletresParaula[i] === lletra) {
      lletresMostrades[i] = lletra;
      aparicions++;
    }
  }

  const jugador = jugadors[torn];
  if (aparicions > 0) {
    // Encert: ratxa + 1 i es sumen ratxa x aparicions
    jugador.ratxa++;
    jugador.punts += jugador.ratxa * aparicions;
  } else {
    // Error: ratxa a 0 i -1 punt (mai negatiu)
    jugador.ratxa = 0;
    if (jugador.punts > 0) jugador.punts--;
    errors++;
    imatgeGlobus.src = "../img/globus-" + errors + ".png";
    if (jugadors.length === 2) torn = (torn + 1) % 2; // passa el torn
  }

  mostrarParaula();
  if (lletresMostrades.indexOf("_") === -1) acabarPartida(true);
  else if (errors >= MAX_ERRORS) acabarPartida(false);
  else actualitzarTargetes();
}

// Final de la partida (guanyada o perduda)
function acabarPartida(haGuanyat) {
  partidaActiva = false;

  // Mostrem la paraula i el color de fons
  lletresMostrades = lletresParaula.slice();
  mostrarParaula();
  paraulaSecreta.classList.add(haGuanyat ? "guanyada" : "perduda");
  for (let i = 0; i < contenidorLletres.children.length; i++) contenidorLletres.children[i].disabled = true;

  // Estadístiques de cada jugador
  const data = new Date().toLocaleString("ca-ES").replace(",", "");
  for (let i = 0; i < jugadors.length; i++) {
    const j = jugadors[i];
    j.total++;
    if (j.punts > j.millorPunts) {
      j.millorPunts = j.punts;
      j.millorData = data;
    }
    // Puntuació més alta de totes (localStorage)
    if (j.punts > Number(localStorage.getItem("millorPunts"))) {
      localStorage.setItem("millorNom", j.nom);
      localStorage.setItem("millorPunts", j.punts);
      localStorage.setItem("millorData", data);
    }
  }

  // Guanya qui té més punts (si empaten, qui ha encertat l'última lletra). Si es perd, no guanya ningú
  if (haGuanyat) {
    let guanyador = jugadors[torn];
    for (let i = 0; i < jugadors.length; i++) {
      if (jugadors[i].punts > guanyador.punts) guanyador = jugadors[i];
    }
    guanyador.guanyades++;
  }

  // Tornem a habilitar el formulari i el botó
  inputParaula.disabled = false;
  botoComencar.disabled = false;
  actualitzarTargetes();
  actualitzarTitol();
}

// Icona de l'ull: canvia entre punts i text
botoUll.addEventListener("click", function () {
  const amagada = inputParaula.type === "password";
  inputParaula.type = amagada ? "text" : "password";
  botoUll.setAttribute("aria-pressed", amagada);
});

// Botó "Tornar"
document.getElementById("boto-tornar").addEventListener("click", function () {
  if (confirm("Estàs segur que vols deixar la partida? En cas afirmatiu perdràs tota la puntuació.")) {
    window.location.href = "../index.html";
  }
});

// Botó "Instruccions": finestra nova de 400 x 400
document.getElementById("boto-instruccions").addEventListener("click", function () {
  window.open("instruccions.html", "instruccions", "width=400,height=400");
});

// Botó "Tancar" del diàleg
document.getElementById("tancar-dialeg").addEventListener("click", function () {
  dialeg.close();
});

// Estat inicial
actualitzarTargetes();
actualitzarTitol();
