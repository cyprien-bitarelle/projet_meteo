//Clé API OpenWeatherMap. On la place ici dans le cas où on l'utiliserait dans plusieurs fonctions.
const apikey = config.WEATHER;

async function récupererPaysListe() {
  let select = document.getElementById("pays");
  let url = `https://restcountries.com/v3.1/all`;
  let donnees = await fetch(url);
  let data = await donnees.json();
  console.log(data);
  data.forEach((element) => {
    let pays = `<option value='${element.cca2}'>${element.translations.fra.common}</option>`;
    select.insertAdjacentHTML("beforeend", pays);
  });
}

récupererPaysListe();

//Afficher la map.
let mymap = L.map("mapid").setView([48.856614, 2.3522219], 9);
L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/streets-v11",
    tileSize: 512,
    zoomOffset: -1,
    //Token leaflet
    accessToken: config.LEAFLET,
  }
).addTo(mymap);

//Demande la possibilité de géolocaliser l'appareil et qui récupère les données géo grâce à la propriété js navigator.geolocation et la method getCurrentPosition.
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // console.log(position.coords);
      position = position.coords;
      requete(position.latitude, position.longitude);
      mymap = mymap.panTo(new L.LatLng(position.latitude, position.longitude));
    },
    function (error) {
      console.log(
        `Erreur de géolocalisation N°${error.code} : ${error.message}`
      );
      console.log(error);
    }
  );
}

mymap.on("click", onMapClick);

//Bloc pour afficher la date au bon format sur la page.
const dateActuelle = new Date();
let dateFiche = document.querySelector("#date");
let jour = `<p id="jour"> ${
  dateActuelle
    .toLocaleString("fr-FR", { weekday: "long" })
    .charAt(0)
    .toUpperCase() +
  dateActuelle.toLocaleString("fr-FR", { weekday: "long" }).slice(1)
}</p>`;
let numeroJour = `<p id="num-jour">${dateActuelle.toLocaleString("fr-FR", {
  day: "numeric",
})}</p>`;
let mois_annee = `<p id="mois-annee">${dateActuelle.toLocaleString("fr-FR", {
  month: "long",
  year: "numeric",
})}</p>`;
dateFiche.insertAdjacentHTML("beforeend", jour);
dateFiche.insertAdjacentHTML("beforeend", numeroJour);
dateFiche.insertAdjacentHTML("beforeend", mois_annee);

const heureActuelle = dateActuelle.toLocaleTimeString("fr-FR", {
  hour: "numeric",
  minute: "numeric",
});

message(heureActuelle);

//Mise à jour de l'heure sur la page
const interval = setInterval(updateHeure, 10000);

function updateHeure() {
  let heure = new Date().toLocaleString("fr-FR", {
    hour: "numeric",
    minute: "numeric",
  });
  let heureAffichee = document.getElementById("heure");
  if (heure != heureAffichee.textContent) {
    heureAffichee.innerText = heure;
  }
}

//Fonction qui affiche l'heure locale et qui affiche un message en fonction de l'heure.
function message(heure) {
  let heureFiche = document.getElementById("message");
  let heureLocale = `<p id="heure"> ${heure}</p>`;
  let iconDrole = `<img src="./assets/`;
  let messageDrole = "<p>";
  if (heure < "05:00") {
    messageDrole +=
      "Il est temps d'aller dormir si tu n'es pas déjà au lit... </p>";
    iconDrole += `sommeil.png">`;
  } else if (heure < "07:00") {
    messageDrole +=
      "Il serait temps de te lever et de te préparer pour la journée... </p>";
    iconDrole += `se-lever.png">`;
  } else if (heure < "11:00") {
    messageDrole += "Puisse ta journée être belle et ensoleillée </p>";
    iconDrole += `bonne-journee.png">`;
  } else if (heure < "12:30") {
    messageDrole += "Il est bientôt l'heure de manger </p>";
    iconDrole += `bon-appetit.png">`;
  } else if (heure < "14:00") {
    messageDrole += "Bon appétit </p>";
    iconDrole += `bon-appetit.png">`;
  } else if (heure < "17:00") {
    messageDrole +=
      "Bon après-midi, j'espère que tu ne piques pas du nez ! </p>";
    iconDrole += `piquer-du-nez.png">`;
  } else if (heure < "20:00") {
    messageDrole += "Enfin du temps libre dans la journée </p>";
    iconDrole += `regarder-tv.png">`;
  } else if (heure < "21:00") {
    messageDrole += "Il est l'heure de diner. </p>";
    iconDrole += `diner.png">`;
  } else if (heure < "24:00") {
    messageDrole += "Tu as quartier libre, amuse toi ! </p>";
    iconDrole += `temps-libre.png">`;
  }
  heureFiche.insertAdjacentHTML("beforeend", iconDrole);
  heureFiche.insertAdjacentHTML("beforeend", heureLocale);
  heureFiche.insertAdjacentHTML("beforeend", messageDrole);
}

function onMapClick(e) {
  let positionlat = e.latlng.lat;
  let positionlong = e.latlng.lng;
  requete(positionlat, positionlong);
}

//Fonction de requete selon la géolocalisation de l'utilisateur. Async pour laisser le code se dérouler en cas d'attente.
async function requete(latitude, longitude) {
  let baseURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=fr&appid=${apikey}`;
  //Try - Catch qui permet de récupérer une erreur éventuelle.
  try {
    //On va chercher les données nécessaire à l'url donné.
    let donnees = await fetch(baseURL);
    if (donnees.ok != true) {
      throw new Error(donnees.status);
    } else {
      //On transforme les données .json en fichier exploitable par javascript.
      let data = await donnees.json();
      afficher(data);
    }
  } catch (erreur) {
    console.log(erreur);
    alert(`${erreur.name} : ${erreur.message}`);
  }
}

//Fonction permettant de récupérer les données entrées par l'utilisateur et appelle la fonction "requete".
function recupText() {
  let input = document.getElementById("input").value;
  let pays = document.querySelector("#pays").value;
  console.log(pays);
  //Condition qui vérifie si un pays est rentré ou pas.
  if (pays == "") {
    requeteSimple(input);
  } else {
    requeteDouble(input, pays);
  }
}

//Fonction qui permet de récupérer les données fournis par l'API si uniquement le champs "input" est rempli.
async function requeteSimple(input) {
  let baseURL = `https://api.openweathermap.org/data/2.5/weather?q=${input}&units=metric&lang=fr&appid=${apikey}`;
  try {
    let donnees = await fetch(baseURL);
    if (donnees.ok != true) {
      throw new Error(donnees.status);
    } else {
      let data = await donnees.json();
      afficher(data);
    }
  } catch (erreur) {
    console.log(erreur);
    alert(`${erreur.name} : ${erreur.message}`);
  }
}

//Fonction qui permet de récupérer les données fournis par l'API si les champs "input" et "pays" sont remplis.
async function requeteDouble(input, pays) {
  let baseUrl = `https://api.openweathermap.org/data/2.5/weather?q=${input},${pays}&units=metric&lang=fr&appid=${apikey}`;
  try {
    let donnees = await fetch(baseUrl);
    if (donnees.ok != true) {
      throw new Error(donnees.status);
    } else {
      let data = await donnees.json();
      afficher(data);
    }
  } catch (erreur) {
    console.log(erreur);
    alert(`Couple pays-ville non reconnu ${erreur.name} : ${erreur.message}`);
  }
}

//Fonction d'affichage des données basiques qui correspondent à l'entrée de l'utilisateur(avec le pays renseigné ou non).

function afficher(stats) {
  mymap = mymap.panTo(new L.LatLng(stats.coord.lat, stats.coord.lon));
  let fiche = document.querySelector("#resultat");
  let dateCouche = new Date(stats.sys.sunset * 1000);
  let dateCFR = dateCouche.toLocaleTimeString("fr-FR", {
    hour: "numeric",
    minute: "numeric",
  });
  //la méthode charAt renvoie une nouvelle chaine avec le caractère a la position 0 puis on recoupe la chaine originale a la position 1 et on concatène.
  let affiche = `
    <p>${stats.name} - ${stats.sys.country}</p>
    <p>${
      stats.weather[0].description.charAt(0).toUpperCase() +
      stats.weather[0].description.slice(1)
    }</p>
    <p>Température actuelle ${stats.main.temp.toFixed(1)}°C</p>
    <p>Vitesse du vent : ${(stats.wind.speed * 3.6).toFixed(0)}km/h</p>
    <p>Taux d'humidité : ${stats.main.humidity}%</p>
    <p><img id="coucher-de-soleil" src="./assets/coucher-de-soleil.png" alt="icone d'un coucher de soleil"></p>
    <p>Le soleil se couchera à ${dateCFR} (Heure française)</p>`;
  fiche.innerHTML = affiche;
  afficherIcon(stats.weather[0].main, fiche);
}

//Fonction qui renvoie une icone en fonction des informations récupérées sur l'API.
// On intègre ensuite l'image au bon endroit avec firstElementChild et insertAdjacentHTML.
function afficherIcon(weather, fiche) {
  let p = fiche.firstElementChild;
  let icon = '<p><img id="icon" src="./assets/';
  switch (weather) {
    case "Clear":
      icon = icon + 'clear.svg"></p>';
      break;
    case "Snow":
      icon = icon + 'snow.svg"></p>';
      break;
    case "Thunderstorm":
      icon = icon + 'thunder.svg"></p>';
      break;
    case "Drizzle":
      icon = icon + 'rain.svg"></p>';
      break;
    case "Rain":
      icon = icon + 'rain_thunder.svg"></p>';
      break;
    case "Clouds":
      icon = icon + 'overcast.svg"></p>';
      break;
    default:
      icon = icon + 'clear.svg"></p>';
      break;
  }
  p.insertAdjacentHTML("afterend", icon);
}
