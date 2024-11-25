// Funkce pro aktivaci geolokace
var prepinacPolohy = false;
var previousHeading = 0;
var cumulativeDeltaHeading = 0;

// Proměnné pro plynulou rotaci pohledu
var startBearing = 0; // počáteční úhel
var endBearing = 0; // koncový úhel
var duration = 300; // trvání animace v milisekundách

// Funkce pro animaci markeru --- nyní nepoužíváme, máme statickou šipku
/*function moveMarker(marker, newLatLng) {
    // Odebrání třídy pro animaci
    marker.getElement().classList.remove('move');

    // Nastavení nové pozice
    marker.setLatLng(newLatLng);

    // Přidání třídy pro animaci zpět po krátké prodlevě
    setTimeout(() => {
        marker.getElement().classList.add('move');
    }, 0);
}*/

// Funkce pro plynulou změnu úhlu pohledu
function animateBearing(startBearing, endBearing, duration) {
    var startTime = null;

    function animate(time) {
        if (!startTime) startTime = time;
        var elapsed = time - startTime;

        // Vypočítání aktuálního úhlu pohledu
        var progress = Math.min(elapsed / duration, 1);
        progress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        var currentBearing = startBearing + (endBearing - startBearing) * progress;

        // Nastavení úhlu pohledu
        map.setBearing(-currentBearing);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
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
            if (map.hasLayer(mapLibreBright) || map.hasLayer(mapLibreDark)) {
                aktualniPoloha.addTo(map);
            } else {
                document.getElementById('fixedArrow').style.visibility = 'visible';
            }
            map.setZoom(18);
            prepinacPolohy = true;
        } else {
            map.stopLocate();
            document.getElementById('fixedArrow').style.visibility = 'hidden'; // Zrušíme stacionární šipku
            tracking = false; // Nastavení stavu sledování na false
            map.setBearing(0);
            releaseWakeLock();
            // Pokud existuje šipka, zrušíme ji.
            if (marker) {
                map.removeLayer(aktualniPoloha); 
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
	previousHeading = heading;
    
    // Příklad volání funkce pro aktualizaci hodnot
    updateValues(Math.round(accuracy), Math.round(heading), Math.round(speed), Math.round(cumulativeDeltaHeading));

    // Aktualizace značky a mapy
    if (prepinacPolohy) {
        // Volání animace přesunutí kurzoru
//moveMarker(aktualniPoloha, L.latLng([lat, lon])); // Přesunout na novou pozici
        //aktualniPoloha.setLatLng([lat, lon]);
    } else {
        // Pokud marker neexistuje, vytvoříme ho
//aktualniPoloha = L.marker([lat, lon]).addTo(map); 
//map.setView(([lat, lon]), map.getZoom(), { animate: true, pan: { duration: 1 }});
    }
    //marker.setLatLng([lat, lon]);
    map.setView(([lat, lon]), map.getZoom(), { animate: true, pan: { duration: 2 }});

    // Otáčení mapy nebo šipky podle směru pohybu
//var arrowElement = aktualniPoloha.getElement().querySelector('.arrow-position');
    if (map.hasLayer(sat)) {
        activeLayerName = "sat";
        document.getElementById('fixedArrow').style.visibility = 'visible'; // Zviditelníme stacionární šipku
        if (speed > 1) {
            //var deltaHeading = Math.abs(heading - previousHeading); //Toto je nejspíš nadbytečné
            if (cumulativeDeltaHeading >= 20) { // malé inkrementální změny kód neprovedou
                endBearing = heading;
                animateBearing(startBearing, endBearing, duration);
                //map.setBearing(-heading); // Negace pro správnou orientaci --- rušíme, protože rotaci animujeme v předchozím řádku
                startBearing = endBearing; // Musíme nastavit pro další polohu aktuální natočení.
                //if (arrowElement) {
                //    arrowElement.style.transform = 'rotate(0deg)'; // Ujistíme se, že šipka směřuje pouze vzhůru
                //}
                cumulativeDeltaHeading = 0; // reset kumulativní změny
            }
        }
    } else if (map.hasLayer(osm)) {
        activeLayerName = "osm";
        document.getElementById('fixedArrow').style.visibility = 'visible'; // Zviditelníme stacionární šipku
        if (speed > 1) {
            //var deltaHeading = Math.abs(heading - previousHeading); //Toto je nejspíš nadbytečné
            if (cumulativeDeltaHeading >= 20) { // malé inkrementální změny kód neprovedou
                endBearing = heading;
                animateBearing(startBearing, endBearing, duration);
                //map.setBearing(-heading); // Negace pro správnou orientaci --- rušíme, protože rotaci animujeme v předchozím řádku
                startBearing = endBearing; // Musíme nastavit pro další polohu aktuální natočení.
                //if (arrowElement) {
                //    arrowElement.style.transform = 'rotate(0deg)'; // Ujistíme se, že šipka směřuje pouze vzhůru
                //}
                cumulativeDeltaHeading = 0; // reset kumulativní změny
            }
        }
    } else if (map.hasLayer(mapLibreBright) || map.hasLayer(mapLibreDark)) {
        //activeLayerName = "mapLibre";
        document.getElementById('fixedArrow').style.visibility = 'hidden'; // Skytí stacionární šipky
        map.setBearing(0); // Ujistíme se, že mapa směřuje vzhůru
        // V jiných mapách máme stacionární šipku, zde ji musíme přidat dle lat lon.
        var arrowElement = aktualniPoloha.getElement().querySelector('.arrow-position');
        aktualniPoloha.setLatLng([lat, lon]);
        if (!map.hasLayer(aktualniPoloha)) {
			aktualniPoloha.addTo(map);
		}
        // Rotace s animací šipky při alternativní mapě
        if (arrowElement) {
            arrowElement.style.transition = 'transform 0.5s ease-in-out';
            arrowElement.style.transform = 'rotate(' + heading + 'deg)';
        }
        cumulativeDeltaHeading = 0; // reset kumulativní změny - kvůli možné změně pohledu a nakumulování úhlu
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
function updateValues(gpsValue, uhelValue, rychlostValue, zoomlevelValue) {
    document.getElementById('gps').innerText = '⌀ ' + gpsValue;
    document.getElementById('uhel').innerText = '➚ ' + uhelValue + '°';
    document.getElementById('rychlost').innerText = Math.round(rychlostValue*3.6) + ' km/h';
    document.getElementById('zoomlevel').innerText = '⬍ ' + zoomlevelValue;
}
