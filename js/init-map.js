// Inicializace mapy

var map = L.map('map', {
    scrollWheelZoom: false,
    smoothWheelZoom: true,
    smoothSensitivity: 5,
}).setView([49.1951, 16.6068], 13); // Souřadnice Brna

// Přidání OpenStreetMap a ostatních dlaždic

var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 22,
    attribution: '© OpenStreetMap'
});
var sat = L.tileLayer.wms('https://ags.cuzk.cz/arcgis1/services/ORTOFOTO/MapServer/WMSServer', {
	  layers: 0,
	  format: 'image/jpeg',
	  maxZoom: 22,
	  transparent: true,
	  attribution: '&copy; <a href="https://www.cuzk.cz/">ČÚZK</a>'
});
var baseMaps = {
    "Klasická mapa": osm,
    "Satelitní snímky": sat,
};