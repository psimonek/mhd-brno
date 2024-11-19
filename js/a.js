// Funkce pro aktivaci geolokace
var arrowIcon = L.divIcon({
    className: 'arrow-icon',
    html: '<svg class="arrow-position" width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="rgba(255,87,0,0.5)" stroke="rgb(255,87,0)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 22 12 18 22 22 12 2" /></svg>',
    iconSize: [30, 30],
    iconAnchor: [20, 20] // Ukotvení ikony na střed
});

var aktualniPoloha = L.marker([0, 0], { icon: arrowIcon });
var prepinacPolohy = false;

function getLocation() {
    if (navigator.geolocation) {
        if (!tracking) {


            
            // Funkce pro aktualizaci polohy
            function onLocationFound(e) {
                var radius = e.accuracy / 2;

                console.log(e);
            
                // Plynulý posun mapy na novou pozici
                map.setView(e.latlng, map.getZoom(), { animate: true });
            
                // Přidání kruhu kolem aktuální polohy (volitelné)
                L.circle(e.latlng, radius).addTo(map);
            }

            // Aktivace sledování polohy
            map.locate({ setView: true, watch: true });
            
            map.on('locationfound', onLocationFound);
            map.on('locationerror', onLocationError);

            // Zpracování chyb
            function onLocationError(e) {
                alert(e.message);
            }


            
            tracking = true; // Nastavení stavu sledování na true
            requestWakeLock();
            //aktualniPoloha.addTo(map);
            map.setZoom(18);
            prepinacPolohy = true;
        } else {
            //navigator.geolocation.clearWatch(watchId); // Zrušení sledování

            stopLocate();


            
            tracking = false; // Nastavení stavu sledování na false
            map.setBearing(0);
            releaseWakeLock();
            if (marker) {
                map.removeLayer(aktualniPoloha); // Předpokládám, že marker je instance Leaflet.Marker nebo podobného objektu
                prepinacPolohy = false;
            }
        }
    } else {
        alert("Geolokace není podporována tímto prohlížečem.");
    }
}

function showPosition(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;

    // Získání směru pohybu
    var heading = position.coords.heading !== null ? position.coords.heading : 0;
    var accuracy = position.coords.accuracy !== null ? position.coords.accuracy : 0;
    var speed = position.coords.accuracy !== null ? position.coords.speed : 0;


    // Příklad volání funkce pro aktualizaci hodnot
updateValues(Math.round(accuracy), Math.round(heading), Math.round(speed));


    

    // Aktualizace značky a mapy
    if (prepinacPolohy) {
        aktualniPoloha.setLatLng([lat, lon]);
    } else {
        // Pokud marker neexistuje, vytvořte ho
        aktualniPoloha = L.marker([lat, lon]).addTo(map); // Předpokládám, že používáte Leaflet
        map.setView([lat, lon], 18);
    }
    //marker.setLatLng([lat, lon]);
    map.setView([lat, lon]);

    // Otáčení mapy nebo šipky podle směru pohybu
    var arrowElement = aktualniPoloha.getElement().querySelector('.arrow-position');
    if (map.hasLayer(sat)) {
        activeLayerName = "sat";
        map.setBearing(-heading); // Negace pro správnou orientaci
        if (arrowElement) {
            arrowElement.style.transform = 'rotate(0deg)'; // Ujistíme se, že šipka směřuje pouze vzhůru
        }
    } else if (map.hasLayer(osm)) {
        activeLayerName = "osm";
        map.setBearing(-heading); // Negace pro správnou orientaci
        if (arrowElement) {
            arrowElement.style.transform = 'rotate(0deg)'; // Ujistíme se, že šipka směřuje pouze vzhůru
        }
    } else if (map.hasLayer(mapLibreBright) || map.hasLayer(mapLibreDark)) {
        //activeLayerName = "mapLibre";
        map.setBearing(0); // Ujistíme se, že mapa směřuje vzhůru
        if (arrowElement) {
            arrowElement.style.transform = 'rotate(' + heading + 'deg)';
        }    
    }
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("Uživatel nepovolil sdílení polohy.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Poloha není k dispozici.");
            break;
        case error.TIMEOUT:
            alert("Žádost o polohu vypršela.");
            break;
        case error.UNKNOWN_ERROR:
            alert("Nastala neznámá chyba.");
            break;
    }
}

// Funkce pro aktualizaci hodnot v debug okně
function updateValues(gpsValue, uhelValue, rychlostValue) {
    document.getElementById('gps').innerText = '🛰️ ' + gpsValue;
    document.getElementById('uhel').innerText = '🌏 ' + uhelValue;
    document.getElementById('rychlost').innerText = '🛣️ ' + rychlostValue + ' km/h';
}
