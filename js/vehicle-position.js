loadStopsCsv();

let ws = null;
let trackingButton = false;
const vehicles = new Map();
const STREAM_URL = 'wss://gis.brno.cz/geoevent/ws/services/stream_kordis_26/StreamServer/subscribe';

const stopsMap = new Map(); // normalizedId (číslo jako string) -> název

let _overlayCheckStarted = false;
let _wsOverlayHidden = false;
const _wsOverlayId = 'ws-loading-overlay-duckai';

const targetZoom = 17;
const groupDelay = L.layerGroup()
let bearing = 0;


// Načte stops.csv a uloží mapu s klíči normalizovanými tak, že z hodnot
// jako "U1234Z1" získá "1234".
async function loadStopsCsv(url = 'stops.csv') {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch stops.csv: ' + res.status);
        const txt = await res.text();
        const lines = txt.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            const rawLine = lines[i].trim();
            if (!rawLine) continue;
            const parts = rawLine.split(';');
            if (parts.length < 2) continue;
            let rawId = parts[0].trim().replace(/^"|"$/g, '');
            const name = parts.slice(1).join(';').trim().replace(/^"|"$/g, '');
            // Normalizace: najdeme první číslicovou posloupnost v rawId
            const m = rawId.match(/\d+/);
            if (!m) continue;
            const normalized = m[0]; // např. "1234"
            stopsMap.set(normalized, name);
        }
    } catch (e) {
        // ticho — nezapisovat do konzole podle požadavku
    }
}

// Barva podle LineID
function colorForLine(lineId, vtype) {
    const id = Number(lineId) || 0;
    const vt = Number(vtype);
    if (vt === 5) return '#c66b4b';
    if (id >= 1 && id <= 20) return '#d32d2a';       // červená
    if (id >= 21 && id <= 39) return '#4ca14c';      // zelená
    if (id >= 40 && id <= 88) return '#247ac8';      // modrá
    if (id >= 89 && id <= 99) return '#000000';      // černá
    if (id >= 100 && id <= 999) return '#878686';    // tmavě šedá
    return '#1978c8';
}

// SVG trojúhelník s bílým outline (stroke) a číslem linky nezávislým na rotaci
function createTriangleHtml(bearing=0, size=38, fillColor='#1978c8', lineText='') {
    const half = size / 2;
    // trojúhelník orientovaný špičkou nahoru; polygon má bílý stroke pro outline
    // číslo linky vložíme jako <text> s opačnou rotací (rotate(-bearing)) tak, aby zůstalo rovné
    // ale protože text uvnitř rotovaného wrapperu by se také rotoval, vytvoříme dvě vrstvy:
    // - wrapper s rotací pro SVG trojúhelník
    // - nad ním absolutně pozicovaný text bez rotace
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <polygon points="${half},2 ${size-2},${size-2} ${half},${size-6} 2,${size-2}"
                 fill="${fillColor}" stroke="#ffffff" stroke-width="1.5" />
      </svg>
    `;
    const textHtml = lineText ? `<div style="position:absolute;left:0;top:60%;width:${size}px;margin-top:-0.6em;text-align:center;font-weight:800;color:#ffffff;font-size:${Math.floor(size/3.4)}px;text-shadow:0 0 2px rgba(0,0,0,0.5);pointer-events:none;">${lineText}</div>` : '';
    const wrapper = `
      <div style="position:relative; width:${size}px; height:${size}px; display:inline-block; transform: rotate(${bearing}deg);">
        ${svg}
        ${textHtml}
      </div>
    `;
    return wrapper;
}

function createCircleHtml(bearing=0, size=30, fillColor='#1978c8', lineText='') {
    // Vytvoření kružnice s daným poloměrem
    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" 
                fill="${fillColor}" stroke="#ffffff" stroke-width="1.5" />
      </svg>
    `;
    const textHtml = lineText ? `<div style="position:absolute;left:0;top:50%;width:${size}px;margin-top:-0.7em;text-align:center;font-weight:800;color:#ffffff;font-size:${Math.floor(size/3.2)}px;text-shadow:0 0 2px rgba(0,0,0,0.5);pointer-events:none;">${lineText}</div>` : '';
    const wrapper = `
      <div style="position:relative; width:${size}px; height:${size}px; display:inline-block; transform: rotate(${bearing}deg);">
        ${svg}
        ${textHtml}
      </div>
    `;
    return wrapper;
}


// vytvoří L.divIcon
function createTriangleIcon(bearing=0, size=38, fillColor='#1978c8', lineText='') {
    const html = createTriangleHtml(bearing, size, fillColor, lineText);
    return L.divIcon({
        html,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
    });
}

function createCircleIcon(bearing, size=30, fillColor='#1978c8', lineText='') {
    const html = createCircleHtml(bearing, size, fillColor, lineText);
    return L.divIcon({
        html,
        className: '',
        iconSize: [size, size],
        iconAnchor: [size/2, size/2]
    });
}


// aktualizace ikony u existujícího markeru (přehození na novou divIcon)
function updateMarkerIcon(marker, bearing, lineId, lineName, isInactive, vtype, size=38) {
    const color = colorForLine(lineId, vtype);
    const txt = (lineName !== undefined && lineName !== null) ? String(lineName) : '';

    if (!isInactive) {
        const newIcon = createTriangleIcon(bearing, 38, color, txt);
        marker.setIcon(newIcon);
    } else {
        const newIconCircle = createCircleIcon(bearing, 30, color, txt);
        marker.setIcon(newIconCircle);
    }
    //marker.setIcon(newIcon);
}

// --- Zpracování dat (stejné jako dříve) ---
function handleMessage(msgText) {
    try {
        const obj = JSON.parse(msgText);
        if (Array.isArray(obj)) obj.forEach(processEnvelope);
        else processEnvelope(obj);
    } catch (e) {
        msgText.trim().split(/\r?\n/).forEach(line => {
            if (!line) return;
            try { const o = JSON.parse(line); if (Array.isArray(o)) o.forEach(processEnvelope); else processEnvelope(o); }
            catch(err){ /* ignore */ }
        });
    }
}

function processEnvelope(envelope) {
    if (!envelope) return;
    const rec = envelope.attributes || envelope;
    processRecord(rec);
}

function processRecord(record) {
    if (!record || typeof record.ID === 'undefined') return;

    // Nastavíme ikonu filtrování na dostupnou
    setSvgFillById('svg-filter', '#000000');

    const id = String(record.ID);
    const isInactive = (record.IsInactive === "true" || record.IsInactive === true);
    //if (isInactive || record.Lat == null || record.Lng == null) {
    //    const m = vehicles.get(id);
    //    if (m) { map.removeLayer(m); vehicles.delete(id); }
    //    return;
    //}
    const lat = Number(record.Lat);
    const lng = Number(record.Lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    _hideOverlayAfterMarkersRendered(); // spustí se pouze jednou díky _overlayCheckStarted

    const bearingRecord = Number(record.Bearing || 0);
    bearing = bearingRecord - endBearing; // Výpočet natočení šipky vozidla MHD vůči rotaci mapy, např. při navigaci
    if (bearing < 0) bearing += 360; // Pokud vyjde záporná hodnota, přepočíst do systému 0-360.

    const lineId = record.LineID;
    const lineName = record.LineName;

    console.log("Stav filterButtonState:" + filterButtonState);
    if (filterButtonState && filterLineNumber !== lineName) {
        //const m = vehicles.get(id);
        //if (m) {
        //    try { map.removeLayer(m); } catch(e) {}
        //    vehicles.delete(id);
        //}
        return;
    } // Pokud filtrujeme zobrazení linky a linka není aktuální záznam, ukončíme funkci

    const vtype = record.VType;

    const rawFinalStop = record.FinalStopID != null ? String(record.FinalStopID).trim() : '';
    // rawFinalStop očekáváme už jako číslo nebo řetězec číslic, ale normalizujeme stejně
    const m = rawFinalStop.match(/\d+/);
    const lookupKey = m ? m[0] : rawFinalStop;
    const finalStopName = stopsMap.get(lookupKey) || rawFinalStop || '';

    const popup = `<strong>${record.LineName || lineId || ''} » ${finalStopName}</strong><br># ${record.ID}&nbsp;&nbsp;&nbsp;⇄ ${record.Course}&nbsp;&nbsp;&nbsp;➠${record.Delay} min.`;
    //const tooltipDelay = `${record.Delay} min.`; --- příliš náročné na vykreslení na mobilu.

    if (vehicles.has(id)) {
        const marker = vehicles.get(id);
        marker.setLatLng([lat, lng]);
        marker._lineName = lineName;
        updateMarkerIcon(marker, bearing, lineId, lineName, isInactive, vtype);
        //marker.setTooltipContent(tooltipDelay); // aktualizuje existující tooltip --- příliš náročné na vykreslení na mobilu.
        if (marker.getPopup()) marker.setPopupContent(popup);
    } else {
        if (!isInactive) {
            const icon = createTriangleIcon(bearing, 38, colorForLine(lineId, vtype), lineName !== undefined ? String(lineName) : '');
            const marker = L.marker([lat, lng], {icon});
            marker._lineName = lineName;
            //marker.bindTooltip(tooltipDelay, { permanent: true, direction: 'top' }); --- příliš náročné na vykreslení na mobilu.
            marker.bindPopup(popup);
            marker.addTo(map);

            vehicles.set(id, marker);
        } else {
            const icon = createCircleIcon(bearing, 30, colorForLine(lineId, vtype), lineName !== undefined ? String(lineName) : '');
            const marker = L.marker([lat, lng], {icon});
            marker._lineName = lineName;
            marker.bindPopup(popup);
            marker.addTo(map);
            vehicles.set(id, marker);
        }
    }
}

// --- Filter a WS ---
function sendFilter(wsInstance, lineFilter = null) {
    if (!wsInstance || wsInstance.readyState !== WebSocket.OPEN) return;
    const where = lineFilter ? `LineID = ${Number(lineFilter)}` : "1=1";
    const filter = {
        filter: {
            where: where,
            outFields: "ID,Lat,Lng,Bearing,LineID,LineName,IsInactive,FinalStopID,VType,Course,Delay"
        }
    };
    wsInstance.send(JSON.stringify(filter));
}

function startWebsocket(lineFilter = null) {
    if (ws) return;
    _showWsOverlay(); // zobrazíme hlášku o čekání na data
    ws = new WebSocket(STREAM_URL);
    ws.addEventListener('open', () => { sendFilter(ws, lineFilter); });
    ws.addEventListener('message', ev => {
        if (typeof ev.data === 'string') handleMessage(ev.data);
        else {
            const reader = new FileReader();
            reader.onload = () => handleMessage(reader.result);
            reader.readAsText(ev.data);
        }
    });
    ws.addEventListener('close', () => { ws = null; });
    ws.addEventListener('error', () => { /* ignore */ });
}

function stopWebsocket() {
    if (!ws) {
        _hideAndRemoveWsOverlay();
        // reset příznaků tak, aby další start fungoval korektně
        _overlayCheckStarted = false;
        _wsOverlayHidden = false;
        return;
    }
    try { ws.close(); } catch(e) {}
    ws = null;
    _hideAndRemoveWsOverlay();
    _overlayCheckStarted = false;
    _wsOverlayHidden = false;

    // Nastavíme tlačítka na stav disabled.
    setSvgFillById('svg-filter', '#999999');
    setBackgroundById('filterbutton-id', '#ffffff');
    filterButtonState = false;
}

// Nastavení a skriptování zprávy o čekání na data o poloze vozidel

// --- Loading overlay komponenta ---

function _createWsOverlayIfNeeded() {
    if (document.getElementById(_wsOverlayId)) return;
    const el = document.createElement('div');
    el.id = _wsOverlayId;
    el.style.position = 'fixed';
    el.style.left = '50%';
    el.style.top = '50%';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.zIndex = '2147483647'; // velmi vysoký z-index
    el.style.pointerEvents = 'none';
    el.style.padding = '18px 26px';
    el.style.background = 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(40,40,40,0.95))';
    el.style.color = '#fff';
    el.style.borderRadius = '12px';
    el.style.boxShadow = '0 8px 30px rgba(0,0,0,0.5)';
    el.style.fontFamily = 'Inter, Roboto, system-ui, Arial, sans-serif';
    el.style.fontSize = '16px';
    el.style.fontWeight = '600';
    el.style.backdropFilter = 'blur(6px) saturate(120%)';
    el.style.opacity = '0';
    el.style.transition = 'opacity 220ms ease';
    el.style.display = 'flex';
    el.style.gap = '12px';
    el.style.alignItems = 'center';
    el.style.pointerEvents = 'none';

    // jednoduché spinner SVG
    const spinner = document.createElement('div');
    spinner.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 50 50" style="display:block;opacity:0.95">
      <circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,0.12)" stroke-width="6" fill="none"></circle>
      <path d="M45 25a20 20 0 0 0-20-20" stroke="#ffffff" stroke-width="6" stroke-linecap="round" fill="none">
        <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.9s" repeatCount="indefinite" />
      </path>
    </svg>
  `;
    spinner.style.flex = '0 0 auto';
    el.appendChild(spinner);

    const text = document.createElement('div');
    text.textContent = 'Čekám na data o poloze vozidel...';
    text.style.pointerEvents = 'none';
    el.appendChild(text);

    document.body.appendChild(el);

    // force reflow then fade in
    requestAnimationFrame(() => { el.style.opacity = '1'; });
}

function _showWsOverlay() {
    // reset příznaků při novém zobrazení
    _overlayCheckStarted = false;
    _wsOverlayHidden = false;
    _createWsOverlayIfNeeded();
    const el = document.getElementById(_wsOverlayId);
    if (!el) return;
    el.style.display = 'flex';
    requestAnimationFrame(() => { el.style.opacity = '1'; });
}

function _hideAndRemoveWsOverlay() {
    const el = document.getElementById(_wsOverlayId);
    if (!el) return;
    // prevent multiple removals
    if (_wsOverlayHidden) return;
    _wsOverlayHidden = true;
    el.style.opacity = '0';
    setTimeout(() => { const e = document.getElementById(_wsOverlayId); if (e && e.parentNode) e.parentNode.removeChild(e); }, 260);
}

function _hideOverlayAfterMarkersRendered() {
    if (_overlayCheckStarted) return;
    _overlayCheckStarted = true;
    const maxWait = 7000;
    const start = performance.now();

    (function check() {
        // detekce elementů Leaflet markerů (pokryje divIcon i img-based markery)
        const anyMarker = document.querySelector('.leaflet-marker-icon, .leaflet-marker-pane img, .leaflet-marker-pane div');
        if (anyMarker) {
            _hideAndRemoveWsOverlay();
            return;
        }
        if (performance.now() - start > maxWait) {
            _hideAndRemoveWsOverlay();
            return;
        }
        setTimeout(check, 80);
    })();
}

// Konec zprávy o čekání na načtení dat polohy vozidel