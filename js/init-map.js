// Inicializace mapy
var arrowIcon = L.divIcon({
    className: 'arrow-icon move',
    html: '<svg class="arrow-position" width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="rgba(255,87,0,0.5)" stroke="rgb(255,87,0)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 22 12 18 22 22 12 2" /></svg>',
    iconSize: [30, 30],
    iconAnchor: [15, 15] // Ukotvení ikony na střed
});

var aktualniPoloha = L.marker([0, 0], { icon: arrowIcon });

var map = L.map('map', {
    scrollWheelZoom: false,
    smoothWheelZoom: true,
    smoothSensitivity: 5,
	rotate: true
	//touchRotate: true
}).setView([49.1951, 16.6068], 13); // Souřadnice Brna

// Přidání OpenStreetMap a ostatních dlaždic

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
});
var sat = L.tileLayer.wms('https://ags.cuzk.cz/arcgis1/services/ORTOFOTO/MapServer/WMSServer', {
	  layers: 0,
	  format: 'image/jpeg',
	  maxZoom: 19,
	  transparent: true,
	  attribution: '&copy; <a href="https://www.cuzk.cz/">ČÚZK</a>'
});
var mapLibreBright = L.maplibreGL({
    style: 'mapstyle/bright.json',
    attribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> Data: © OpenStreetMap'
    });
var mapLibreDark = L.maplibreGL({
    style: 'mapstyle/dark.json',
    attribution: '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> Data: © OpenStreetMap'
    });
var baseMaps = {
    "Klasická mapa": osm,
    "Satelitní snímky": sat,
	"Alternativní mapa": mapLibreBright,
	//"Silniční (tmavá)": mapLibreDark
};

// Při přepnutí mapy potřebujeme vyvolat funkci pro aplikování stylů Dark/Light mode a stylu navigace (otáčení mapy nebo šipky).
// Zde se jedná pouze o vyvolání správních hodnot při přepnutí mapy. Samotné chování během navigace se definuje v get-location.js

map.on('baselayerchange', function(e) {
    if (typeof setTheme === 'function') {
        setTheme(); // Znovu nastavení módu dark/light při změně mapy. Vyvolá se jen, pokud už je definovaná
    } else {
        console.log('Funkce setTheme není definována.');
    } 
	if (map.hasLayer(sat)) {
        map.setBearing(0); // Reset rotace mapy
		if (map.hasLayer(aktualniPoloha)) {
			map.removeLayer(aktualniPoloha);
		}
        if (typeof arrowElement !== 'undefined') {
            // Pokud arrowElement existuje, můžeme s ní pracovat
            arrowElement.style.transform = 'rotate(0deg)'; // Reset možné zrotované šipky
        } else {
            console.log('Proměnná arrowElement není definována.');
        }
    } else if (map.hasLayer(osm)) {
        map.setBearing(0); // Reset rotace mapy
		if (map.hasLayer(aktualniPoloha)) {
			map.removeLayer(aktualniPoloha);
		}
        if (typeof arrowElement !== 'undefined') {
            // Pokud arrowElement existuje, můžeme s ní pracovat
            arrowElement.style.transform = 'rotate(0deg)'; // Reset možné zrotované šipky
        } else {
            console.log('Proměnná arrowElement není definována.');
        }
    } else {
        map.setBearing(0); // Reset rotace mapy
		var elementFixedArrow = document.getElementById('fixedArrow');
		if (elementFixedArrow) {
  			elementFixedArrow.style.visibility = 'hidden';
		}
    }
});
