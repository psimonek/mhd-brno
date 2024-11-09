let lastUpdateTime = 0; // Čas poslední aktualizace
const updateInterval = 1000; // Interval aktualizace v milisekundách (např. 1000 ms = 1 sekunda)
let currentBearing = 0; // Aktuální úhel otáčení

// Funkce pro aktivaci geolokace
function getLocation() {
    if (navigator.geolocation) {
        if (!tracking) {
            watchId = navigator.geolocation.watchPosition(showPosition, showError, {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 5000
            });
            tracking = true; // Nastavení stavu sledování na true
        } else {
            navigator.geolocation.clearWatch(watchId); // Zrušení sledování
            tracking = false; // Nastavení stavu sledování na false
            map.setBearing(0);
        }
    } else {
        alert("Geolokace není podporována tímto prohlížečem.");
    }
}

function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Získání směru pohybu
    const heading = position.coords.heading !== null ? position.coords.heading : 0;

    // Aktualizace značky
    marker.setLatLng([lat, lon]);

    // Centrování mapy na uživatelovu polohu
    map.setView([lat, lon], map.getZoom(), { animate: true });

    // Kontrola, zda je čas na aktualizaci otáčení mapy
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime > updateInterval) {
        // Plynulé otáčení mapy podle směru pohybu
        const targetBearing = -heading; // Negace pro správnou orientaci
        const delta = targetBearing - currentBearing;

        // Zajištění, že otáčení je plynulé
        if (Math.abs(delta) > 180) {
            currentBearing += (delta > 0 ? delta - 360 : delta + 360) * 0.1; // Otočení přes 360°
        } else {
            currentBearing += delta * 0.1; // Plynulé otáčení
        }

        // Nastavení nového úhlu otáčení
        // Použití CSS transformace pro otáčení mapy
        const mapContainer = document.querySelector('.leaflet-map-pane');
        mapContainer.style.transform = `rotate(${currentBearing}deg)`;

        lastUpdateTime = currentTime; // Aktualizace času poslední aktualizace
    }
}

function showError(error) {
    switch(error.code) {
        case error.PERMISSION_DENIED:
            alert("Uživatel odmítl žádost o geolokaci.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Poloha není k dispozici.");
            break;
        case error.TIMEOUT:
            alert("Žádost o geolokaci vypršela.");
            break;
        case error.UNKNOWN_ERROR:
            alert("Nastala neznámá chyba.");
            break;
    }
}
