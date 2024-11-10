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
            requestWakeLock();            
        } else {
            navigator.geolocation.clearWatch(watchId); // Zrušení sledování
            tracking = false; // Nastavení stavu sledování na false
            map.setBearing(0);
            releaseWakeLock();
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

    // Aktualizace značky a mapy
    marker.setLatLng([lat, lon]);
    map.setView([lat, lon]);

    // Otáčení mapy podle směru pohybu
    map.setBearing(-heading); // Negace pro správnou orientaci
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
