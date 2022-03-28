//Clé API. On la place ici dans le cas où on l'utiliserait dans plusieurs fonctions.
const apikey = "";


let mymap = L.map('mapid').setView([48.856614, 2.3522219], 9);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
maxZoom: 18,
id: 'mapbox/streets-v11',
tileSize: 512,
zoomOffset: -1,
accessToken: ''
}).addTo(mymap);

//Demande la possibilité de géolocaliser l'appareil et qui récupère les données géo grâce à la propriété js navigator.geolocation et la method getCurrentPosition.
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
        // console.log(position.coords);
        position = position.coords;
        requete(position.latitude, position.longitude);
      }, function(error) {
        console.log(`Erreur de géolocalisation N°${error.code} : ${error.message}`);
        console.log(error);
      });
    }


function onMapClick(e) {
    console.log(e);
    let positionlat = e.latlng.lat;
    let positionlong =e.latlng.lng;
    requete(positionlat, positionlong);
}

mymap.on('click', onMapClick);

//Fonction de requete selon la géolocalisation de l'utilisateur. Async pour laisser le code se dérouler en cas d'attente.
async function requete(latitude, longitude){
    let baseURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=fr&appid=${apikey}`;

    //Try - Catch qui permet de récupérer une erreur éventuelle.
    try {

        //On va chercher les données nécessaire à l'url donné.
        let donnees = await fetch(baseURL);
        // console.log(`données`, donnees);
            if (donnees.ok != true) {
                throw new Error(donnees.status);
            } else {

                //On transforme les données .json en fichier exploitable par javascript.
                let data = await donnees.json();
                // console.log(`data`,data);
                afficher(data);
                fondEcran(data);
            }
    } catch (erreur) {
        console.log(erreur);
        alert(`${erreur.name} : ${erreur.message}`);
    }
}

//Fonction permettant de récupérer les données entrées par l'utilisateur et appelle la fonction "requete".
function recupText(){
    let input = document.getElementById("input").value;
    let pays = document.querySelector("#pays").value;
    // console.log(`Entrée utilisateur : ${input}`);
    // console.log(pays);

    //Condition qui vérifie si un pays est rentré ou pas.
    if (pays =="") {
        requeteSimple(input);
    } else{
        requeteDouble(input, pays);
    }

}

//Fonction qui permet de récupérer les données fournis par l'API si uniquement le champs "input" est rempli.
async function requeteSimple(input){
    let baseURL =  `https://api.openweathermap.org/data/2.5/weather?q=${input}&units=metric&lang=fr&appid=${apikey}`;

    //Try - Catch qui permet de récupérer une erreur éventuelle.
    try {

        //On va chercher les données nécessaire à l'url donné.
        let donnees = await fetch(baseURL);
        console.log(`données`, donnees);
            if (donnees.ok != true) {
                throw new Error(donnees.status);
            } else {

                //On transforme les données .json en fichier exploitable par javascript.
                let data = await donnees.json();
                console.log(`data`,data);
                afficher(data);
                fondEcran(data);
            }
    } catch (erreur) {
        console.log(erreur);
        alert(`${erreur.name} : ${erreur.message}`);
    }
}
//Fonction qui permet de récuperer le code du pays via une seconde API.
async function requeteDouble(input, pays) {
    let url = `https://restcountries.eu/rest/v2/name/${pays}?fullText=true`;

     //Try - Catch qui permet de récupérer une erreur éventuelle.
     try {

        //On va chercher les données nécessaire à l'url donné.
        let donnees = await fetch(url);
        // console.log(`données`, donnees);
            if (donnees.ok != true) {
                throw new Error(donnees.status);
            } else {

                //On transforme les données .json en fichier exploitable par javascript.
                let data = await donnees.json();
                console.log(`data`,data);
                // console.log(data[0].alpha2Code);
                afficherAvecPays(input, data[0].alpha2Code);
            }
    } catch (erreur) {
        console.log(erreur);
        alert(`Pays non reconnu ! ${erreur.name} : ${erreur.message}`);
    }
}
//Fonction qui permet de récupérer les données fournis par l'API si les champs "input" et "pays" sont remplis.
async function afficherAvecPays(input, pays) {
    let baseUrl = `https://api.openweathermap.org/data/2.5/weather?q=${input},${pays}&units=metric&lang=fr&appid=${apikey}`;
    // console.log(baseUrl);
     //Try - Catch qui permet de récupérer une erreur éventuelle.
     try {

        //On va chercher les données nécessaire à l'url donné.
        let donnees = await fetch(baseUrl);
        // console.log(`données`, donnees);
            if (donnees.ok != true) {
                throw new Error(donnees.status);
            } else {

                //On transforme les données .json en fichier exploitable par javascript.
                let data = await donnees.json();
                console.log(`data`,data);
                afficher(data);
                fondEcran(data);
            }
    } catch (erreur) {
        console.log(erreur);
        alert(`${erreur.name} : ${erreur.message}`);
    }
}


//Fonction d'affichage des données basiques qui correspondent à l'entrée de l'utilisateur(avec le pays renseigné ou non).
function afficher(stats){
    let fiche = document.querySelector("#resultat");
    let affiche = `
    <p><img src =" https://openweathermap.org/img/wn/${stats.weather[0].icon}.png"></p>
    <div class="info"><li>${stats.name}</li>
    <li>${stats.sys.country}</li>
    <li>Température actuelle ${stats.main.temp.toFixed(1)}°C</li>
    <li onclick="plusinfos(${stats.id}), changement()" id= "soulign_lien">Plus d'infos</li></div>`;
    fiche.innerHTML = affiche;
    // console.log(`affichage` ,affiche);
    fiche.classList.add("box_shadow");
    console.log(stats);
    changement2();
}

//Fonction qui permet de récupérer les données fournis par l'API en fonction de l'id fourni par celle-ci. Sert à refaire une requête sur la même ville et récupérer les données afin d'en afficher plus.
async function plusinfos(id) {
        // console.log(id);
        let baseURL = `https://api.openweathermap.org/data/2.5/weather?id=${id}&units=metric&lang=fr&appid=${apikey}`;
        try {
            let donnees = await fetch(baseURL);
            // console.log(donnees);
            if (donnees.ok != true) {
                throw new Error(donnees.status);
            } else {
                let data = await donnees.json();
                console.log(data)
                afficherplusinfos(data);
            }
        } catch (error) {
            console.log(error);
            alert(`${error.name} : ${error.message}`);
        }
}

//Fonction d'affichage qui permet d'afficher plus d'informations au clic de l'utilisateur.
function afficherplusinfos(ville) {
    let nouvFiche = document.querySelector("#resultat");
    let dateCouche = new Date(ville.sys.sunset * 1000);
    let dateCFR = dateCouche.toLocaleString('fr-FR', {
        weekday:"long",
        year:'numeric',
        month:"long",
        day:'numeric',
        hour:'numeric',
        minute:'numeric'
    });
    let nouvAffiche = `
    <li>${ville.name}</li>
    <li>${ville.sys.country}</li>
    <li>(${ville.weather[0].description})</li>
    <li class="text_center">Température actuelle ${ville.main.temp.toFixed(1)}°C</li>
    <li>Vitesse du vent : ${(ville.wind.speed*3.6).toFixed(0)}km/h</li>
    <li>Taux d'humidité : ${ville.main.humidity}%</li>
    <li class="text_center">Le soleil se couche ${dateCFR} (Heure française)</li>`;
    nouvFiche.innerHTML = nouvAffiche;


}
//Fonction d'affichage qui gère le changement de fond d'écran en fonction du temps qu'il fait
function fondEcran(temps){
    let fond = document.getElementById('fond');
    // console.log(temps.weather[0].main);
    //En cas de recherche multiple classList.remove sert à retirer la class précedente et à réafficher une nouvelle image adaptée.
    fond.classList.remove('thunderstorm','drizzle', 'rain', 'snow', 'clear', 'clouds')
    if (temps.weather[0].main == "Thunderstorm") {
        fond.classList.add('thunderstorm');
    } else {if (temps.weather[0].main == "Drizzle") {
        fond.classList.add('drizzle');
    } else {if (temps.weather[0].main == "Rain") {
        fond.classList.add('rain');
    } else {if (temps.weather[0].main == "Snow") {
        fond.classList.add('snow');
    } else {if (temps.weather[0].main == "Clear") {
        fond.classList.add('clear');
    } else {if (temps.weather[0].main == "Clouds") {
        fond.classList.add('clouds');
    } else {
        fond.classList.add('clear');
    }
    }
    }
    }
    }
    }
}

//Change le style CSS de la carte d'affichage.
function changement(){
    let resultat = document.getElementById('resultat');
    resultat.classList.remove('resultat');
    resultat.classList.add('plusinfos');
}

function changement2(){
    let resultat = document.getElementById('resultat');
    resultat.classList.remove('plusinfos');
    resultat.classList.add('resultat');
}
