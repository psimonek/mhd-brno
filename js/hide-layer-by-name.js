function hideLayerByName(name) {
	for (var key in hladiny) {
		if (hladiny.hasOwnProperty(key)) {
			var layer = hladiny[key];
		    // Zkontrolujte, zda je vrstva, kterou chcete odstranit, skutečně vrstvou
		    if (layer instanceof L.LayerGroup) { // nebo jiný typ vrstvy, pokud používáte jinou knihovnu
		        if (key !== name) {
		            map.removeLayer(layer);
		         } else {
		            map.addLayer(layer);
		         }
		     }
		}
	}
}
