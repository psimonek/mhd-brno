// Funkce pro aktualizaci průhlednosti
function updateOpacity(opacity) {
    Object.values(baseMaps).forEach(function(layer) {
        layer.setOpacity(opacity);
    });
}
// Přidání slideru pro průhlednost
var opacityControl = L.control({
    position: 'topright',    
});
opacityControl.onAdd = function(map) {
    var opacityContainer = L.DomUtil.create('div', 'leaflet-control-opacity');
    opacityContainer.style.background = 'white';
    opacityContainer.style.padding = '6px';
    opacityContainer.style.border = '1px solid #ccc';
    opacityContainer.style.borderRadius = '5px';
    opacityContainer.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.2)';
    var opacityLabel = L.DomUtil.create('label', '', opacityContainer);
    opacityLabel.innerHTML = '<span style="text-align: center; font-size: 1.1em;">Průhlednost mapy</span>';
    opacityLabel.style.display = 'block';
    opacityLabel.style.marginBottom = '10px';
    var opacitySlider = L.DomUtil.create('input', '', opacityContainer);
    opacitySlider.type = 'range';
    opacitySlider.min = 0;
    opacitySlider.max = 1;
    opacitySlider.step = 0.1;
    opacitySlider.value = 1;
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