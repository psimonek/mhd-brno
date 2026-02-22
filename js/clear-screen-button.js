let hideButtonState = false;

// Předpoklad: máte proměnnou map = L.map(...);

// Vytvoření vlastního tlačítka
const clearScreenButton = L.Control.extend({
    options: { position: 'topleft' }, // levý horní roh
    onAdd: function(map) {
        const container = L.DomUtil.create('div', 'leaflet-bar my-custom-control');
        const btnhide = L.DomUtil.create('a', '', container);
        btnhide.id = 'hidebutton-id';
        btnhide.href = '#';
        btnhide.title = 'Skrýt zobrazenou trasu linky';
        btnhide.innerHTML = '<svg id="svg-hide" width="18px" height="18px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="padding-top:6px;fill:#999999;fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">\n' +
            '    <g>\n' +
            '        <path d="M324,269.366C315.095,260.366 251.461,197.561 242,188C293.121,179.866 331.948,216.787 324,269.366Z"/>\n' +
            '        <path d="M0,256C11.025,206.274 94,148 94,148C94,148 71.396,124.667 63,116C48.837,99.421 77.757,78.25 89,90C142.667,143.586 384,384.556 421,421.5C436.29,436.79 409.11,462.11 395,448C386.417,439.417 361.892,414.892 347,400C179.434,463.717 11.131,319.076 0,256ZM158,212C169.105,222.92 178.083,231.583 188,241.5C177.73,293.874 222.597,333.593 270.5,324.5C280.311,334.355 293.833,347.833 300,354C226.9,392.741 112.857,316.63 158,212Z"/>\n' +
            '        <path d="M512,256C505.333,294.708 444.508,346.82 418,364C402.146,348.146 375.333,321.333 354,300C395.34,211.384 305.601,118.406 211,157C196,142 173.372,119.372 166,112C317.864,55.517 482.11,165.905 512,256Z"/>\n' +
            '    </g>\n' +
            '</svg>\n'; // ikona/text tlačítka

        // Zabránit propagaci událostí do mapy (pohyb/zoom)
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);


        L.DomEvent.on(btnhide, 'click', (e) => {
            L.DomEvent.stopPropagation(e);
            L.DomEvent.preventDefault(e);

            // Pokud je tlačítko zašedlé, neprovádíme žádnou akci
            const svgState = document.getElementById('svg-hide');
            if (svgState && svgState.style.fill !== '#999999' && svgState.style.fill !== 'rgb(153, 153, 153)') {
                if (!hideButtonState) {
                    if (linkaCislo > 999) {
                        hideLayerByVariant(linkaCislo);
                    } else {
                        hideLayerByName(linkaCislo);
                    }
                    btnhide.style.backgroundColor = 'orange';
                    hideButtonState = true;
                } else {
                    if (linkaCislo > 999) {
                        showLayerByVariant(linkaCislo);
                    } else {
                        showLayerByName(linkaCislo);
                    }
                    btnhide.style.backgroundColor = 'white';
                    hideButtonState = false;

                }
            }
        });

        return container;
    }
});

// Přidání ovládacího prvku do mapy
map.addControl(new clearScreenButton());
