function showAllLayers() {
	for (var key in hladiny) {
    	if (hladiny.hasOwnProperty(key)) {
        	var layer = hladiny[key];
        	// Zkontrolujeme, zda je vrstva, kterou chceme odstranit, skutečně vrstvou
        	if (layer instanceof L.LayerGroup) { // nebo jiný typ vrstvy, pokud používáme jinou knihovnu
            	map.addLayer(layer);
        	}
    	}
	}
}
