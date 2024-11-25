// Funkce pro aktivaci geolokace
var previousHeading = 0;
var cumulativeDeltaHeading = 0;

// Proměnné pro plynulou rotaci pohledu
var startBearing = 0; // počáteční úhel
var endBearing = 0; // koncový úhel
var duration = 300; // trvání animace v milisekundách

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

// Hlavní kód pro získání povolení ke sledování polohy a poté získávání hodnot ze snímačů.

function getLocation() {
    if (navigator.geolocation) {
        if (!tracking) {
            // Aktivace sledování polohy
            map.locate({ setView: false, maxZoom: 19, watch: true, maximumAge: 0, enableHighAccuracy: true });
            map.on('locationfound', showPosition);
            map.on('locationerror', showError);
            tracking = true; // Nastavení stavu sledování na true
            requestWakeLock();
			map.setZoom(18);
            document.getElementById('fixedArrow').style.visibility = 'visible';
        } else {
            map.stopLocate();
            document.getElementById('fixedArrow').style.visibility = 'hidden'; // Zrušíme stacionární šipku
            tracking = false; // Nastavení stavu sledování na false
            map.setBearing(0);
            releaseWakeLock();
        }
    } else {
        alert("Geolokace není podporována tímto prohlížečem.");
    }
}

// Hlavní kód pro zpracování dat získaných ze senzorů a aplikování na mapu.

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
    
    // Volání funkce pro aktualizaci hodnot debuggeru.
    updateValues(Math.round(accuracy), Math.round(heading), Math.round(speed), Math.round(cumulativeDeltaHeading));

    map.setView(([lat, lon]), map.getZoom(), { animate: true, pan: { duration: 2 }});

	var arrowElement = document.querySelector('.arrow-position'); // Načítáme šipku z dokumentu pro pozdější rotaci.

    // Otáčení mapy nebo šipky podle směru pohybu
    if (map.hasLayer(sat)) {
        activeLayerName = "sat";
        document.getElementById('fixedArrow').style.visibility = 'visible'; // Zviditelníme stacionární šipku
        if (speed > 1) {
            if (cumulativeDeltaHeading >= 8) { // malé inkrementální změny kód neprovedou
                endBearing = heading;
                animateBearing(startBearing, endBearing, duration);
                startBearing = endBearing; // Musíme nastavit pro další polohu aktuální natočení.
                if (arrowElement) {
                    arrowElement.style.transform = 'rotate(0deg)'; // Ujistíme se, že šipka směřuje pouze vzhůru
                }
                cumulativeDeltaHeading = 0; // reset kumulativní změny
            }
        }
    } else if (map.hasLayer(osm)) {
        activeLayerName = "osm";
        document.getElementById('fixedArrow').style.visibility = 'visible'; // Zviditelníme stacionární šipku
        if (speed > 1) {
            if (cumulativeDeltaHeading >= 8) { // malé inkrementální změny kód neprovedou
                endBearing = heading;
                animateBearing(startBearing, endBearing, duration);
                startBearing = endBearing; // Musíme nastavit pro další polohu aktuální natočení.
                if (arrowElement) {
                    arrowElement.style.transform = 'rotate(0deg)'; // Ujistíme se, že šipka směřuje pouze vzhůru
                }
                cumulativeDeltaHeading = 0; // reset kumulativní změny
            }
        }
    } else if (map.hasLayer(mapLibreBright) || map.hasLayer(mapLibreDark)) {
        //activeLayerName = "mapLibre";
        document.getElementById('fixedArrow').style.visibility = 'hidden'; // Skytí stacionární šipky
        map.setBearing(0); // Ujistíme se, že mapa směřuje vzhůru
        // Rotace s animací šipky při alternativní mapě
        if (arrowElement) {
            arrowElement.style.transition = 'transform 1s ease-in-out';
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
    document.getElementById('gps').innerText = '⦿ ' + gpsValue + ' m';
    document.getElementById('uhel').innerText = '➚ ' + uhelValue + '°';
    document.getElementById('rychlost').innerText = Math.round(rychlostValue*3.6) + ' km/h';
    document.getElementById('zoomlevel').innerText = '± ' + zoomlevelValue + '°';
}
