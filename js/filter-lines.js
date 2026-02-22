// Vytvoření vlastního tlačítka
const filterLinesButton = L.Control.extend({
    options: { position: 'topleft' }, // levý horní roh
    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar my-custom-control');
        const bttnfilter = L.DomUtil.create('a', '', container);
        bttnfilter.id = 'filterbutton-id';
        bttnfilter.href = '#';
        bttnfilter.title = 'Zobrazit pouze polohu vozidel vybrané linky';
        bttnfilter.innerHTML = '<svg id="svg-filter" style="padding-top:6px;fill:#999999"  width="18px" height="18px" viewBox="0 0 36 36" version="1.1" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n' +
            '\n' +
            '<g  stroke-width="0"/>\n' +
            '\n' +
            '<g  stroke-linecap="round" stroke-linejoin="round"/>\n' +
            '\n' +
            '<g <title>filter-solid</title> <path  d="M22,33V19.5L33.47,8A1.81,1.81,0,0,0,34,6.7V5a1,1,0,0,0-1-1H3A1,1,0,0,0,2,5V6.67a1.79,1.79,0,0,0,.53,1.27L14,19.58v10.2Z"/>\n' +
            '\n' +
            '<path d="M33.48,4h-31A.52.52,0,0,0,2,4.52V6.24a1.33,1.33,0,0,0,.39.95l12,12v10l7.25,3.61V19.17l12-12A1.35,1.35,0,0,0,34,6.26V4.52A.52.52,0,0,0,33.48,4Z" class="clr-i-solid clr-i-solid-path-1"/> <rect x="0" y="0" width="36" height="36" fill-opacity="0"/> </g>\n' +
            '\n' +
            '</svg>';

        // Zabránit propagaci událostí do mapy (pohyb/zoom)
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);


        L.DomEvent.on(bttnfilter, 'click', (e) => {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);

            // Pokud je tlačítko zašedlé, neprovádíme žádnou akci
            const svgState = document.getElementById('svg-filter');
            if (svgState && svgState.style.fill !== '#999999' && svgState.style.fill !== 'rgb(153, 153, 153)') {

                if (!filterButtonState) {
                    filterLineNumber = linkaCisloFiltr;
                    console.log("linkaCisloFiltr: " + linkaCisloFiltr);
                    bttnfilter.style.backgroundColor = 'orange';
                    filterButtonState = true;

                    // při filtrování odstraníme všechny linky, které momentálně nefiltrujeme
                    for (const [id, marker] of vehicles.entries()) {
                        const ln = marker._lineName || marker.options.lineName; // fallback
                        if (String(ln) !== String(filterLineNumber)) {
                            try {
                                map.removeLayer(marker);
                            } catch (e) {
                            }
                            //vehicles.delete(id);
                        }
                    }

                } else {
                    showLayerByName(linkaCisloFiltr);
                    bttnfilter.style.backgroundColor = 'white';
                    filterLineNumber = 0;
                    filterButtonState = false;

                    for (const [id, marker] of vehicles.entries()) {
                        const ln = marker._lineName || marker.options.lineName; // fallback
                        if (String(ln) !== String(filterLineNumber)) {
                            try {
                                map.addLayer(marker);
                                ;
                            } catch (e) {
                            }
                            //vehicles.delete(id);
                        }
                    }
                }
            } else {
                filterButtonState = false;
            }
        });

        return container;
    }
});

// Přidání ovládacího prvku do mapy
map.addControl(new filterLinesButton());
