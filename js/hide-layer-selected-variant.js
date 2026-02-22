function hideLayerByVariant(name) {
    console.log("Hodnota v hideLayerByName: " + name);
    for (var key in hladiny) {
        if (hladiny.hasOwnProperty(key)) {
            var layer = hladiny[key];
            // Zkontrolujte, zda je vrstva, kterou chcete odstranit, skutečně vrstvou
            if (layer instanceof L.LayerGroup) { // nebo jiný typ vrstvy, pokud používáte jinou knihovnu
                console.dir(hladiny);
                if (key === name) {
                    console.log("Nerovná se");
                    map.removeLayer(layer);
                    tooltips.clearLayers(); // Musíme vyprázdnit skupinu tooltipů pro zobrazování zastávek u varianty.
                } else {
                    console.log("Rovná se");
                    //map.addLayer(layer);
                }
            }
        }
    }
}
