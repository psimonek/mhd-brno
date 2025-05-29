function loadLinesAndStops(lineRef) {

	tooltips.clearLayers(); // Musíme vyprázdnit skupinu tooltipů pro zobrazování zastávek u varianty.
	
	var entityArray = []; //Vytvoříme Array pro relace pro fitBounding
	
	if (lineRef === "Rež") {
		var xmlData = "/lines-data/rezijni.osm";
	} else {
		var overpassUrl = "/lines-data/" + lineRef + ".json"; // Vytvoření URL pro JSON soubor
	    //var overpassUrl = 'https://overpass-api.de/api/interpreter?data=[out:json];relation["network"="IDS JMK"]["ref"="' + lineRef + '"]["type"!="disused:route"](49.0928,16.4067,49.3211,16.7953);out geom;>;node(w)["public_transport"="stop_position"];out geom;';
	}
    
	// Otevření detailu linky při volání výpisu.
	sidebar.open('info');
	
	var resetDiv = document.getElementById("resetLayers");
	resetDiv.innerHTML = "";
    var textToAddReset = '<p style="display: flex; align-items: center;"><a onClick="loadLinesAndStops(\'' + lineRef + '\');" href="#" style="display: flex; align-items: center;"><img class="svg-img" src="img/reset.svg" alt="Go back Icon" style="margin-right: 8px; height: 24px; width: 24px;">Zobrazit všechny varianty (resetovat výběr)</a></p>'; // Získáme text, který chceme přidat.
    resetDiv.innerHTML = textToAddReset;

	if (lineRef === "Rež") {
		console.log(xmlData);
		// Pomocná funkce pro získání hodnoty tagu
		function getTagValue(tags, key) {
		    for (let tag of tags) {
		        if (tag.getAttribute('k') === key) {
		            return tag.getAttribute('v');
		        }
		    }
		    return null;
		}

		fetch(xmlData)
		    .then(response => response.text())
		    .then(data => {
		    	// Parsování XML dat
			    const parser = new DOMParser();
			    const xmlDoc = parser.parseFromString(data, "text/xml");
			    
			    for (var key in hladiny) {
			        if (hladiny.hasOwnProperty(key)) {
			            var layer = hladiny[key];
			            if (layer instanceof L.LayerGroup) {
			                map.removeLayer(layer);
			                delete hladiny[key];
			            }
			        }
			    }
			    
		        // Získání reference na <div> s ID "detailLinky"
				var detailDiv = document.getElementById("detailLinky");
			    detailDiv.innerHTML = ''; // Vymazání obsahu div id="detailLinky"
			    
			    // Získání reference na <div> s ID "diversions"
				var diversionsDiv = document.getElementById("diversions");
		        diversionsDiv.innerHTML = ''; // Vymazání obsahu div id="diversions"
		        
			    // Získání reference na <div> s ID "detail-linky-zastavky"
				var detailDivZast = document.getElementById("detail-linky-zastavky");
			    detailDivZast.innerHTML = ''; // Vymazání obsahu div id="detail-linky-zastávky"
			    
			    // Zpracování relací
			    const relations = xmlDoc.getElementsByTagName("relation");
			    
			    Array.from(relations).forEach(relation => {
			        const tags = relation.getElementsByTagName("tag");
			        const relationDataText = `<span style="font-weight: bold; font-size: 125%;">Linka č. ${getTagValue(tags, 'ref')}</span><br>Z: ${getTagValue(tags, 'from')}<br>Do: ${getTagValue(tags, 'to')}`;
			
			        var hladina = L.layerGroup();
			        var jmenoHladiny = relation.getAttribute('id');
			
			        hladiny[jmenoHladiny] = hladina;
			        hladina.addTo(map);
			
			        // Přidání variant linky do <div id="detailLinky">
			        var textToAdd = `<div class="detail-linky"><a href="#" data-line="${jmenoHladiny}">${getTagValue(tags, 'name')}</a></div>`;
			        // Zkontrolujte, zda <div> již obsahuje nějaký text
					if (detailDiv.innerHTML) {
					    // Pokud ano, přidejte nový text s novým řádkem
					    detailDiv.innerHTML += textToAdd;
					} else {
					    // Pokud ne, jednoduše nastavte text
					    detailDiv.innerHTML = textToAdd;
					}
			
			        // Přidání bound boxu do pole entityArray
	            	var boundLatLon = [
	            		[getTagValue(tags, 'minlat'), getTagValue(tags, 'minlon')],
	            		[getTagValue(tags, 'maxlat'), getTagValue(tags, 'maxlon')]
	            		];
	
	            	entityArray.push(boundLatLon);

			
			        // Zpracování členů relace
			        const members = relation.getElementsByTagName("member");
			
			        Array.from(members).forEach(member => {
			            const memberType = member.getAttribute('type');
			            const memberRef = member.getAttribute('ref');
			            const memberRole = member.getAttribute('role');
			            
	                	// Vykreslení velkého čísla linky v rámečku na nástupní zastávce
	                	
	            	    if (memberRole === 'stop_entry_only') {
	            	    	const node = xmlDoc.querySelector(`node[id='${memberRef}']`);
	            	    	const lat = node.getAttribute('lat');
	            	    	const lon = node.getAttribute('lon');
	                    	var textLatLng = [lat, lon];
	                    	L.marker(textLatLng, {
								icon: L.divIcon({
	    							className: 'text-labels rez-type-line',   // Set class for CSS styling
	    							html: getTagValue(tags, 'ref').split(" ").pop().trim()
									}),
								zIndexOffset: 1000     // Make appear above other map features
							})
							.bindPopup(relationDataText || "Neznámá data", { offset: [25, 5] })
							.addTo(hladina);
	                    }	
	                    		
			            if (memberType === 'node') {
			                const node = xmlDoc.querySelector(`node[id='${memberRef}']`);
			                if (node) {
			                    const lat = node.getAttribute('lat');
			                    const lon = node.getAttribute('lon');
			                    const stopName = getTagValue(node.getElementsByTagName("tag"), 'name');
			
			                    // Vykreslení zastávky
			                    L.circleMarker([lat, lon], { color: '#FF8000', fillColor: "white", fillOpacity: 1, radius: 12, layerType: "circleMarker"})
			                        .bindPopup(stopName || "Neznámá zastávka", { offset: [0, -12] })
			                        .addTo(hladina);
			                }
			            } else if (memberType === 'way') {
			                const way = xmlDoc.querySelector(`way[id='${memberRef}']`);
			                if (way) {
			                    const nds = way.getElementsByTagName("nd");
			                    const latlngs = Array.from(nds).map(nd => {
			                        const node = xmlDoc.querySelector(`node[id='${nd.getAttribute('ref')}']`);
			                        return [node.getAttribute('lat'), node.getAttribute('lon')];
			                    });
			
			                    // Vykreslení cesty
			                    L.polyline(latlngs, { color: '#FF8000', weight: 6 })
			                        .bindPopup(getTagValue(tags, 'name') || "Neznámá cesta")
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
					        setTheme(); // Potřebujeme kvůli zachování barev variant linek při jejich vyvolání a skrytí zkontrolovat režim tmavý/světlý 
					    });
					});
	
					var $cols = $('.detail-linky').click(function(e) {
					    $cols.removeClass(addclass);
					    $(this).addClass(addclass);
					});
			        
			        
					// Výpis zastávek vybrané linky v detailu
					
					function addStoptoDiv(lyr) {
	
						detailDivZast.innerHTML = ''; // vymazaní obsahu div.
						
						detailDivZast.innerHTML += `<h4 style="display: flex; align-items: center;"><img src="img/zastavka.svg" alt="Bus stop Icon" style="margin-right: 8px; height: 24px; width: 24px;">Zastávky vybrané varianty linky</h4>`;
						var dataVrstvy = hladiny[lyr];
									
						// Předpokládáme, že jmenohladiny je vrstva s různými typy
						dataVrstvy.eachLayer(function(layer) {
							console.log(layer);
	
						    // Získání typu vrstvy z options
						    var layerType = layer.options.layerType; // Předpokládáme, že layerType je v options
						    
						    // Získání popupu, pokud existuje
						    var popup = layer._popup; // Přístup k popupu
						    var latlng = layer._latlng;
						
						    // Zkontrolujeme, zda popup existuje a má obsah
						    if (layerType === 'circleMarker' && popup && popup._content) {
						        var stopName = popup._content; // Získání obsahu popupu
						        var latName = latlng.lat;
						        
						        // Přidání tooltipu jména zastávky při zoomu větším než 16.
				                var labelZastavka = L.tooltip({
								  permanent: true,
								  opacity: 0.8,
								  offset: [20, 0],
								  className: 'stop-tooltip'
								})
				                .setLatLng(latlng)
				                .setContent(stopName);
				                
				                // Přidání tooltipu do kolekce vrstev
								tooltips.addLayer(labelZastavka);
								
								if (map.getZoom() > 15 && map.hasLayer(osm) && getStopsCheckboxValue()) {
					                tooltips.addTo(map);
					            }
				                				            
					            // Kontrola zoomu
					            map.on('zoomend', function() {
					            	console.log(getStopsCheckboxValue());
					                if (map.getZoom() > 15 && map.hasLayer(osm) && getStopsCheckboxValue()) {
					                    tooltips.addTo(map);
					                } else {
					                    tooltips.removeFrom(map);
					                }
					            });
	
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
								// se mapa vystředí na souřadnice, které se berou z vrstvy.
								
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

			// Spustíme kontrolu dark/light režimu pro zajištění, že noční linka (černá) se vykreslí světle
			setTheme();
		})
		.catch(error => console.error('Chyba při načítání OSM souboru:', error));
	
	} else {
		
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
		        
		        // Získání reference na <div> s ID "diversions"
				var diversionsDiv = document.getElementById("diversions");
		        diversionsDiv.innerHTML = ''; // Vymazání obsahu div id="diversions"
		        
				// Načtení výluk
				const urlDiversions = 'get-diversions/diversions_v2.json';
				
				// Načtení JSON souboru
				fetch(urlDiversions)
					.then(response => {
						if (!response.ok) {
							throw new Error('Síťová odpověď nebyla v pořádku');
						}
						return response.json();
					})
					.then(data => {
						// Procházení jednotlivých bloků v JSON
						data.diversions.forEach(item => {
							// Převod ISO času na lokální
							const validFromDate = new Date(item.validFrom);
							const validToDate = new Date(item.validTo);
							// Formátování data bez sekund
							const options = {
								year: 'numeric',
								month: '2-digit',
								day: '2-digit',
								hour: '2-digit',
								minute: '2-digit',
								hour12: false // 24hodinový formát
							};
							if (item.affectedLines.includes(lineRef) && item.isValid) {
								diversionsDiv.innerHTML += `<h4 style="display: flex; align-items: center;"><img src="img/alert.svg" alt="Alert Icon" style="margin-right: 8px; height: 24px; width: 24px;">${item.number}: ${item.title}</h4><p>Platnost: ${validFromDate.toLocaleString('cs-CZ', options)} - ${validToDate.toLocaleString('cs-CZ', options)}<br>Linky: ${item.affectedLines.join(', ')}</p>${item.publicTextHtml}`;
							}
						});
					})
					.catch(error => console.error('Chyba při načítání JSON:', error));	        
		        
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
		                		var transportType = 'night-type-line';
		                	} else {
		                		var lineColor = 'rgb(37, 91, 218)';
		                		var transportType = 'bus-type-line';
		                	}
		                } else if (relation.tags.route === 'trolleybus') {
		                	var lineColor = 'rgb(7, 172, 0)';
		                	var transportType = 'trolleybus-type-line';
		                } else if (relation.tags.route === 'tram') {
		                	var lineColor = 'rgb(255, 20, 20)'; 
		                	var transportType = 'tram-type-line';
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
		                        //var way = data.elements.find(e => e.id === member.ref);
		                        //if (way && way.geometry) {
		                            var latlngs = member.geometry.map(function(point) {
		                                return [point.lat, point.lon]; // OSM používá [lat, lon]
		                            });
		                            // Vykreslení tramvajové linky
		                            L.polyline(latlngs, { color: lineColor, weight: 6 })
		                            .bindPopup(relation.tags.name || "Neznámá linka")
		                            .addTo(hladina);
		                        //}
		
		                    } else if (member.type === 'node') {
		                        // Zpracování zastávek
		                        var stop = data.elements.find(e => e.id === member.ref);
		                        if (stop && stop.tags && stop.tags.public_transport === 'stop_position') {
		                            // Vykreslení zastávky
		                            L.circleMarker([stop.lat, stop.lon], { color: lineColor, fillColor: "white", fillOpacity: 1, radius: 12, layerType: "circleMarker"})
		                                .bindPopup(stop.tags.name || "Neznámá zastávka", { offset: [0, -12] })
		                                .addTo(hladina);
		                                //console.dir(hladina);
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
						        setTheme(); // Potřebujeme kvůli zachování barev variant linek při jejich vyvolání a skrytí zkontrolovat režim tmavý/světlý 
						    });
						});
		
						var $cols = $('.detail-linky').click(function(e) {
						    $cols.removeClass(addclass);
						    $(this).addClass(addclass);
						});
						
						// Výpis zastávek vybrané linky v detailu
						
						function addStoptoDiv(lyr) {
		
							detailDivZast.innerHTML = ''; // vymazaní obsahu div.
							//diversionsDiv.innerHTML = ''; // Vymazání obsahu div id=diversions
							
							detailDivZast.innerHTML += `<h4 style="display: flex; align-items: center;"><img src="img/zastavka.svg" alt="Bus stop Icon" style="margin-right: 8px; height: 24px; width: 24px;">Zastávky vybrané varianty linky</h4>`;
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
							        
							        // Přidání tooltipu jména zastávky při zoomu větším než 16.
					                var labelZastavka = L.tooltip({
									  permanent: true,
									  opacity: 0.8,
									  offset: [20, 0],
									  className: 'stop-tooltip'
									})
					                .setLatLng(latlng)
					                .setContent(stopName);
					                
					                // Přidání tooltipu do kolekce vrstev
									tooltips.addLayer(labelZastavka);
									
									if (map.getZoom() > 15 && map.hasLayer(osm) && getStopsCheckboxValue()) {
						                tooltips.addTo(map);
						            }
					                				            
						            // Kontrola zoomu
						            map.on('zoomend', function() {
						            	console.log(getStopsCheckboxValue());
						                if (map.getZoom() > 15 && map.hasLayer(osm) && getStopsCheckboxValue()) {
						                    tooltips.addTo(map);
						                } else {
						                    tooltips.removeFrom(map);
						                }
						            });
		
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
									// se mapa vystředí na souřadnice, které se berou z vrstvy.
									
							        var dataVrstvyZast = hladiny[lyr];
							        dataVrstvyZast.eachLayer(function(layer) {
							      		if (layer._leaflet_id == valueId) {
											// Zvětšení a vystředění mapy na daný bod
											map.setView(L.latLng(layer._latlng.lat, layer._latlng.lng),); // 18 je úroveň přiblížení (nyní není aplikováno, původně bylo .....layer._latlng.lng),18);  )
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
	
			// Spustíme kontrolu dark/light režimu pro zajištění, že noční linka (černá) se vykreslí světle
			setTheme();
	    	})
	    	.catch(error => console.error('Chyba při načítání dat:', error));
   }
}
