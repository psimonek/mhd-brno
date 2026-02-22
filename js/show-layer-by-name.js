function showLayerByName(name) {
    for (var key in hladiny) {
        if (hladiny.hasOwnProperty(key)) {
            var layer = hladiny[key];
            // Zkontrolujte, zda je vrstva, kterou chcete odstranit, skutečně vrstvou
            if (layer instanceof L.LayerGroup) { // nebo jiný typ vrstvy, pokud používáte jinou knihovnu
                if (key !== name) {
                    map.addLayer(layer);
                    //tooltips.clearLayers(); // Musíme vyprázdnit skupinu tooltipů pro zobrazování zastávek u varianty.
                } else {
                   map.addLayer(layer);
                }
            }
        }
    }
}