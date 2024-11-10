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
            var aktualniPoloha = L.marker([0, 0]).addTo(map);
        } else {
            navigator.geolocation.clearWatch(watchId); // Zrušení sledování
            tracking = false; // Nastavení stavu sledování na false
            map.setBearing(0);
            releaseWakeLock();
            if (marker) {
                map.removeLayer(aktualniPoloha); // Předpokládám, že marker je instance Leaflet.Marker nebo podobného objektu
                aktualniPoloha = null;
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

    // Aktualizace značky a mapy
    if (aktualniPoloha) {
        aktualniPoloha.setLatLng([lat, lon]);
    } else {
        // Pokud marker neexistuje, vytvořte ho
        aktualniPoloha = L.marker([lat, lon]).addTo(map); // Předpokládám, že používáte Leaflet
        map.setView([lat, lon], 18);
    }
    //marker.setLatLng([lat, lon]);
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
