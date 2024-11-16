// Inicializace mapy

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
var mapLibre = L.maplibreGL({
    style: 'mapstyle/bright.json',
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
    setTheme(); // Znovu nastavení módu dark/light při změně mapy
	if (map.hasLayer(sat)) {
        map.setBearing(0); // Reset rotace mapy
    	if (arrowElement) {
            arrowElement.style.transform = 'rotate(0deg)'; // Reset možné zrotované šipky
        }
    } else if (map.hasLayer(osm)) {
        map.setBearing(0); // Reset rotace mapy
        if (arrowElement) {
            arrowElement.style.transform = 'rotate(0deg)'; // Reset možné zrotované šipky
        }
    } else if (map.hasLayer(mapLibre)) {
        map.setBearing(0); // Reset rotace mapy
    }
});
