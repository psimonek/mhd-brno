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
        }
    } else {
        alert("Geolokace není podporována tímto prohlížečem.");
    }
}

function showPosition(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;

    // Získání směru pohybu
    if (position.coords.heading !== null) {
        heading = position.coords.heading;
    }

    // Aktualizace značky a mapy
    marker.setLatLng([lat, lon]);
    map.setView([lat, lon]);

    // Otáčení mapy podle směru pohybu
    var rotation = -heading; // Negace pro správnou orientaci
    document.getElementById('map').style.transform = 'rotate(' + rotation + 'deg)';
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