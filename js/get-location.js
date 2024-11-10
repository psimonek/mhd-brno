// Funkce pro aktivaci geolokace
var arrowIcon = L.divIcon({
    className: 'arrow-icon',
    html: '<svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="rgba(255,87,0,0.5)" stroke="rgb(255,87,0)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 22 12 18 22 22 12 2" /></svg>',
    iconSize: [40, 40],
    iconAnchor: [20, 20] // Ukotvení ikony na střed
});

var aktualniPoloha = L.marker([0, 0], { icon: arrowIcon });
var prepinacPolohy = false;

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
            aktualniPoloha.addTo(map);
            prepinacPolohy = true;
        } else {
            navigator.geolocation.clearWatch(watchId); // Zrušení sledování
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
