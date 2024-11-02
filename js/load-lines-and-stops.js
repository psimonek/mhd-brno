function loadLinesAndStops(lineRef) {

	var entityArray = []; //Vytvoříme Array pro relace pro fitBounding
	
    var overpassUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];relation["network"="IDS JMK"]["ref"=' + lineRef + ']["type"!="disused:route"](49.139,16.487,49.211,16.626);out geom;>;out geom;';
    
	// Otevření detailu linky při volání výpisu.
	let linkNaDetail = document.getElementById("infoClick");
	
	// Simulujte kliknutí na odkaz, ale pouze pokud není kliknuto na "Zobrazit všechny varianty", kde je hodnota 1, aby se sidebar neschoval.
	if (prepinac == 0) {
		linkNaDetail.click();
	} else {
		prepinac = 0;
	};
	
	var resetDiv = document.getElementById("resetLayers");
	resetDiv.innerHTML = "";
    var textToAddReset = '<a onClick="prepinac=1;loadLinesAndStops(\'' + lineRef + '\');" href="#">Zobrazit všechny varianty</a></p>'; // Získáme text, který chceme přidat.
    resetDiv.innerHTML = textToAddReset;


    fetch(overpassUrl)
        .then(response => response.json())
        .then(data => {
        	
		 // Předpokládáme, že "hladiny" je objekt, který obsahuje vrstvy
		for (var key in hladiny) {
		    if (hladiny.hasOwnProperty(key)) {
		        var layer = hladiny[key];
		        // Zkontrolujeme, zda je vrstva, kterou chceme odstranit, skutečně vrstvou
		        if (layer instanceof L.LayerGroup) { // nebo jiný typ vrstvy, pokud používáte jinou knihovnu
		            map.removeLayer(layer);
		            delete hladiny[key]; // Odstranění klíče z objektu hladiny
		        }
		    }
		}
            
        // Získání reference na <div> s ID "detailLinky"
		var detailDiv = document.getElementById("detailLinky");
        detailDiv.innerHTML = ''; // Vymazání obsahu div id="detailLinky"
        // Získání reference na <div> s ID "detail-linky-zastavky"
		var detailDivZast = document.getElementById("detail-linky-zastavky");
        detailDivZast.innerHTML = ''; // Vymazání obsahu div id="detail-linky-zastávky"
        
        // Zpracování relací

		data.elements.forEach(function(relation) {
            if (relation.type === 'relation') {

            	var relationDataText = '<span style="font-weight: bold; font-size: 125%;">Linka č. ' + relation.tags.ref + '</span><br>Z: ' + relation.tags.from + '<br>Do: ' + relation.tags.to;
            	
            	
            	
				// Vytvoření layerGroup hladina pro objekt hladiny (definovaný výše), kde jméno objektu je ID relace.
            	
				var hladina = L.layerGroup(); // Vytvoření skupiny vrstev
				// Přiřazení ID relace jako názvu vrstvy
				var jmenoHladiny = relation.id;
				
				hladiny[jmenoHladiny] = hladina; // Uložení vrstvy do objektu s názvem jako klíčem
				hladina.addTo(map);
				//console.log(hladiny);


				
				// Přidání variant linky do <div id="detailLinky">
				
            	var textToAdd = '<div class="detail-linky"><a href="#" data-line="' + relation.id + '">' + relation.tags.name + '</a><div>'; // Získejte text, který chcete přidat
				// Zkontrolujte, zda <div> již obsahuje nějaký text
				if (detailDiv.innerHTML) {
				    // Pokud ano, přidejte nový text s novým řádkem
				    detailDiv.innerHTML += textToAdd;
				} else {
				    // Pokud ne, jednoduše nastavte text
				    detailDiv.innerHTML = textToAdd;
				}
            	
            	
            	// Přidání bound boxu do pole entityArray, které vystředí a zvětší mapu po projetí všech relations.
            	
            	var boundLatLon = [
            		[relation.bounds.minlat, relation.bounds.minlon],
            		[relation.bounds.maxlat, relation.bounds.maxlon]
            		];

            	entityArray.push(boundLatLon);

            	
            	// Zvolení barvy výstupu podle typu dopravního prostředku. 
            	// transportType je určený pro volání css skriptu pro popisy.
            	// lineColor je určeny pro vykreslení dráhy linky.
            	
                if (relation.tags.route === 'bus') {
                	if (relation.tags.ref.startsWith("N")) {
                		var lineColor = 'rgb(0, 0, 0)';
                		var transportType = 'night-type';
                	} else {
                		var lineColor = 'rgb(37, 91, 218)';
                		var transportType = 'bus-type';
                	}
                } else if (relation.tags.route === 'trolleybus') {
                	var lineColor = 'rgb(7, 172, 0)';
                	var transportType = 'trolleybus-type';
                } else if (relation.tags.route === 'tram') {
                	var lineColor = 'rgb(255, 20, 20)'; 
                	var transportType = 'tram-type';
                }
            	
            	// Vykreslení jednotlivých členů relací
            	
                relation.members.forEach(function(member) {
                	
                	// Vykreslení velkého čísla linky v rámečku na nástupní zastávce
                	
            	    if (member.role === 'stop_entry_only') {
                    	var textLatLng = [member.lat, member.lon];
                    	L.marker(textLatLng, {
							icon: L.divIcon({
    							className: 'text-labels '+transportType,   // Set class for CSS styling
    							html: relation.tags.ref
								}),
							zIndexOffset: 1000     // Make appear above other map features
						})
						.bindPopup(relationDataText || "Neznámá data", { offset: [25, 5] })
						.addTo(hladina);
                    }

                    if (member.type === 'way' && member.role === '') {
                        var way = data.elements.find(e => e.id === member.ref);
                        if (way && way.geometry) {
                            var latlngs = way.geometry.map(function(point) {
                                return [point.lat, point.lon]; // OSM používá [lat, lon]
                            });
                            // Vykreslení tramvajové linky
                            L.polyline(latlngs, { color: lineColor, weight: 4 })
                            .bindPopup(relation.tags.name || "Neznámá linka")
                            .addTo(hladina);
                        }

                    } else if (member.type === 'node') {
                        // Zpracování zastávek
                        var stop = data.elements.find(e => e.id === member.ref);
                        if (stop && stop.tags && stop.tags.public_transport === 'stop_position') {
                            // Vykreslení zastávky
                            L.circleMarker([stop.lat, stop.lon], { color: lineColor, fillOpacity: .6, radius: 8, layerType: "circleMarker"})
                                .bindPopup(stop.tags.name || "Neznámá zastávka", { offset: [0, -10] })
                                .addTo(hladina);
                        }                   
                    } 
                });
                
				// Event listener pro výpis položek detailu každé linky na kartě i.
							
				// Najdi všechny elementy s třídou 'detail-linky'
				var naslouchani = document.querySelectorAll('.detail-linky a');
				// Iteruj přes všechny nalezené odkazy a přidej event listener
				naslouchani.forEach(odkaz => {
				    odkaz.addEventListener('click', function(event) {
				        // Zabraň výchozímu chování odkazu
				        event.preventDefault();
				        // Získej hodnotu z atributu data-line
				        var cisloRel = this.getAttribute('data-line');
				        // Vyvolej funkci hideLayerByName s cisloRelace
				        hideLayerByName(cisloRel);
				        // Vyvolej funkci addStoptoDiv s cisloRelace
				        addStoptoDiv(cisloRel);
				    });
				});

				var $cols = $('.detail-linky').click(function(e) {
				    $cols.removeClass(addclass);
				    $(this).addClass(addclass);
				});
				
				// Výpis zastávek vybrané linky v detailu
				
				function addStoptoDiv(lyr) {
					
					detailDivZast.innerHTML = ''; // vymazaní obsahu div.
					
					detailDivZast.innerHTML += "<h3>Zastávky vybrané varianty linky</h3>";
					var dataVrstvy = hladiny[lyr];
					
					// Předpokládáme, že jmenohladiny je vrstva s různými typy
					dataVrstvy.eachLayer(function(layer) {
					
					    // Získání typu vrstvy z options
					    var layerType = layer.options.layerType; // Předpokládáme, že layerType je v options
					    
					    // Získání popupu, pokud existuje
					    var popup = layer._popup; // Přístup k popupu
					    var latlng = layer._latlng;
					
					    // Zkontrolujeme, zda popup existuje a má obsah
					    if (layerType === 'circleMarker' && popup && popup._content) {
					        var stopName = popup._content; // Získání obsahu popupu
					        var latName = latlng.lat;
					        //console.log('Jméno zastávky:', stopName);
					        //console.log(latName);
					        //console.log(layer._leaflet_id);
					        detailDivZast.innerHTML += '<div class="zastavka" id="zastavka"><a href="#" data-line="' + layer._leaflet_id + '" relation="' + lyr + '">' + stopName + '</a></div>';
					    } 
					});		
											
					var naslouchaniZastavky = document.querySelectorAll('.zastavka a');
					// Iteruj přes všechny nalezené odkazy a přidej event listener
					naslouchaniZastavky.forEach(odkaz => {
					    odkaz.addEventListener('click', function(event) {
					        // Zabraň výchozímu chování odkazu
					        event.preventDefault();
					        // Získej hodnotu z atributu data-line
					        var valueId = this.getAttribute('data-line');
					        var relNum = this.getAttribute('relation');
							
							// Při kliknutí na položku zastávky v seznamu se projdou hladiny a při shode _leaflet_id
							// se mapa vystředí na souřadnice, které se berou z vrasvy.
							
					        var dataVrstvyZast = hladiny[lyr];
					        dataVrstvyZast.eachLayer(function(layer) {
					      		if (layer._leaflet_id == valueId) {
									// Zvětšení a vystředění mapy na daný bod
									map.setView(L.latLng(layer._latlng.lat, layer._latlng.lng), 18); // 18 je úroveň přiblížení
									var popup = L.popup()
									    .setLatLng(L.latLng(layer._latlng.lat, layer._latlng.lng))
									    .setContent(layer._popup._content)
									    .openOn(map);
					      		};
					    	});
						});
					
					});
				}
            }
        });

		// Vystředění a zvětšení mapy na všechny relace linky, které jsou načtené výše do pole entityArray
		
		// Vytvoření prázdného LatLngBounds objektu
		var boundsOfRelations = L.latLngBounds();
		
		// Přidání každé souřadnice do bounds
		entityArray.forEach(function(coord) {
		    boundsOfRelations.extend(coord);
		});
		
		// Přizpůsobení mapy tak, aby zahrnovala všechny souřadnice
		map.fitBounds(boundsOfRelations);
    })
    .catch(error => console.error('Chyba při načítání dat:', error));
}
