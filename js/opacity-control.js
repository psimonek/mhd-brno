// Funkce pro aktualizaci průhlednosti
function updateOpacity(opacity) {
    var aktualniVrstva = mapa.getActiveBaseLayer();
console.log('aktualniVrstva:' + aktualniVrstva);
    Object.values(baseMaps).forEach(function(layer) {
        var mapLibreElement = document.querySelector('.maplibregl-map');
        if (mapLibreElement) {
            mapLibreElement.style.opacity = opacity; // Nastavení opacity
        } else {
            layer.setOpacity(opacity);
        }
    });
}

// Přidání slideru pro průhlednost
var opacityControl = L.control({
    position: 'topright',    
});

opacityControl.onAdd = function(map) {
    var opacityContainer = L.DomUtil.create('div', 'leaflet-control-opacity');
    opacityContainer.style.background = 'white';
    opacityContainer.style.padding = '0px';
    opacityContainer.style.border = '2px solid rgba(0, 0, 0, 0.2)';
    opacityContainer.style.borderRadius = '5px';
    opacityContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    opacityContainer.style.display = 'flex';
    opacityContainer.style.flexDirection = 'column'; // Vertikální orientace
    opacityContainer.style.width = '44px';
    opacityContainer.style.height = '124px';

    var opacityLabel = L.DomUtil.create('label', '', opacityContainer);
    opacityLabel.style.display = 'block';
    opacityLabel.style.marginBottom = '10px';

    var opacitySlider = L.DomUtil.create('input', '', opacityContainer);
    opacitySlider.type = 'range';
    opacitySlider.min = 0;
    opacitySlider.max = 1;
    opacitySlider.step = 0.1;
    opacitySlider.value = 1;

    // Přidání stylů pro vertikální slider
    opacitySlider.style.writingMode = 'bt-lr'; // Vertikální orientace
    opacitySlider.style.transform = 'rotate(270deg)'; // Otočení pro správnou orientaci
    opacitySlider.style.margin = '0 auto'; // Centering
    opacitySlider.style.marginLeft = '-26px';
    opacitySlider.style.marginTop = '48px';
    opacitySlider.style.width = '100px'; // Šířka táhla
    opacitySlider.style.height = '8px'; // Výška táhla

    L.DomEvent.on(opacitySlider, 'input', function() {
        updateOpacity(opacitySlider.value);
    });

    L.DomEvent.disableClickPropagation(opacityContainer);
    L.DomEvent.disableScrollPropagation(opacityContainer);
    opacityContainer.appendChild(opacityLabel);
    opacityContainer.appendChild(opacitySlider);
    return opacityContainer;
};

opacityControl.addTo(map);
L.control.layers(baseMaps).addTo(map);
map.addLayer(osm);
