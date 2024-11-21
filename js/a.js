// Funkce pro aktivaci geolokace
var arrowIcon = L.divIcon({
    className: 'arrow-icon move',
    html: '<svg class="arrow-position" width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="rgba(255,87,0,0.5)" stroke="rgb(255,87,0)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 22 12 18 22 22 12 2" /></svg>',
    iconSize: [30, 30],
    iconAnchor: [20, 20] // Ukotvení ikony na střed
});

var aktualniPoloha = L.marker([0, 0], { icon: arrowIcon });
var prepinacPolohy = false;
var previousHeading = 0;
var cumulativeDeltaHeading = 0;

// Funkce pro animaci markeru
function moveMarker(marker, newLatLng) {
    // Odebrání třídy pro animaci
    marker.getElement().classList.remove('move');

    // Nastavení nové pozice
    marker.setLatLng(newLatLng);

    // Přidání třídy pro animaci zpět po krátké prodlevě
    setTimeout(() => {
        marker.getElement().classList.add('move');
    }, 0);
}

function getLocation() {
    if (navigator.geolocation) {
        if (!tracking) {
            // Aktivace sledování polohy
            map.locate({ setView: false, maxZoom: 19, watch: true, maximumAge: 0, enableHighAccuracy: true });
            
            map.on('locationfound', showPosition);
            map.on('locationerror', showError);

            tracking = true; // Nastavení stavu sledování na true
            requestWakeLock();
            aktualniPoloha.addTo(map);
            map.setZoom(18);
            prepinacPolohy = true;
        } else {
            map.stopLocate();
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

function showPosition(e) {
    var lat = e.latitude;
    var lon = e.longitude;

    // Získání směru pohybu
    var heading = e.heading !== null ? e.heading : 0;
    var accuracy = e.accuracy !== null ? e.accuracy : 0;
    var speed = e.speed !== null ? e.speed : 0;
    var zoomlevel = map.getZoom();

    var deltaHeading = Math.abs(heading - previousHeading);
    cumulativeDeltaHeading += deltaHeading;


    // Příklad volání funkce pro aktualizaci hodnot
    updateValues(Math.round(accuracy), Math.round(heading), Math.round(speed), zoomlevel);


    

    // Aktualizace značky a mapy
    if (prepinacPolohy) {
        // Volání animace přesunutí kurzoru
        moveMarker(aktualniPoloha, L.latLng([lat, lon])); // Přesunout na novou pozici
        //aktualniPoloha.setLatLng([lat, lon]);
    } else {
        // Pokud marker neexistuje, vytvoříme ho
        aktualniPoloha = L.marker([lat, lon]).addTo(map); 
        map.setView(([lat, lon]), map.getZoom(), { animate: true, pan: { duration: 1 }});
    }
    //marker.setLatLng([lat, lon]);
    map.setView(([lat, lon]), map.getZoom(), { animate: true, pan: { duration: 2 }});

    // Otáčení mapy nebo šipky podle směru pohybu
    var arrowElement = aktualniPoloha.getElement().querySelector('.arrow-position');
    if (map.hasLayer(sat)) {
        activeLayerName = "sat";
        if (speed > 2) {
            var deltaHeading = Math.abs(heading - previousHeading);
            if (cumulativeDeltaHeading >= 20) { // malé inkrementální změny
                map.setBearing(-heading); // Negace pro správnou orientaci
                if (arrowElement) {
                    arrowElement.style.transform = 'rotate(0deg)'; // Ujistíme se, že šipka směřuje pouze vzhůru
                }
                cumulativeDeltaHeading = 0; // reset kumulativní změny
            }
        }
    } else if (map.hasLayer(osm)) {
        activeLayerName = "osm";
        if (speed > 2) {
            var deltaHeading = Math.abs(heading - previousHeading);
            if (cumulativeDeltaHeading >= 20) { // malé inkrementální změny
                map.setBearing(-heading); // Negace pro správnou orientaci
                if (arrowElement) {
                    arrowElement.style.transform = 'rotate(0deg)'; // Ujistíme se, že šipka směřuje pouze vzhůru
                }
                cumulativeDeltaHeading = 0; // reset kumulativní změny
            }
        }
    } else if (map.hasLayer(mapLibreBright) || map.hasLayer(mapLibreDark)) {
        //activeLayerName = "mapLibre";
        map.setBearing(0); // Ujistíme se, že mapa směřuje vzhůru
        if (arrowElement) {
            arrowElement.style.transition = 'transform 0.5s ease-in-out';
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
    previousHeading = heading;
}

// Funkce pro aktualizaci hodnot v debug okně
function updateValues(gpsValue, uhelValue, rychlostValue, zoomlevelValue) {
    document.getElementById('gps').innerText = '⌀ ' + gpsValue;
    document.getElementById('uhel').innerText = '➚ ' + uhelValue + '°';
    document.getElementById('rychlost').innerText = (rychlostValue*3,6) + ' km/h';
    document.getElementById('zoomlevel').innerText = '⬍ ' + zoomlevelValue;
}
