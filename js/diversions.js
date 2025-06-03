var diversionsList = document.getElementById("diversions-list");
diversionsList.innerHTML = '';

const urlDiversions = 'get-diversions/diversions_v2.json';
let diversionsData = [];

fetch(urlDiversions)
	.then(response => {
		if (!response.ok) {
			throw new Error('Síťová odpověď nebyla v pořádku');
		}
		return response.json();
	})
	.then(data => {
		diversionsData = data.diversions;
		displayDiversions(diversionsData); // Zobrazit všechny výluky na začátku
	})
	.catch(error => console.error('Chyba při načítání JSON:', error));

function displayDiversions(diversions) {
	diversionsList.innerHTML = ''; // Vymazání obsahu
	const today = new Date(); // Získání aktuálního data a času pro správné zobrazení aktuálnosti výluky
	diversions.forEach(item => {
		const validFromDate = new Date(item.validFrom);
		const validToDate = new Date(item.validTo);
		const options = {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		};

		// Vytvoření nadpisu a podrobností
		const diversionItem = document.createElement('div');
		diversionItem.classList.add('diversion-item');

		const header = document.createElement('h4');
		header.style.marginBottom = '0px';
		header.style.display = 'flex';
		header.style.alignItems = 'center';
		header.style.cursor = 'pointer'; // Změna kurzoru na ruku
		if (validFromDate <= today) {
			header.innerHTML = `<img src="img/alert.svg" alt="Alert Icon" style="margin-right: 6px; height: 14px; width: 14px;">${item.number}: ${item.title}`;
		} else {
			header.innerHTML = `<img src="img/alert_inactive2.svg" alt="Alert inactive Icon" style="margin-right: 6px; height: 14px; width: 14px;">${item.number}: ${item.title}`;
		};

		// Přidání platnosti a linek jako součást nadpisu
		const validityInfo = document.createElement('p');
		validityInfo.style.marginTop = '0px';
		validityInfo.style.marginLeft = '0px';
		validityInfo.style.cursor = 'pointer'; // Změna kurzoru na ruku
		validityInfo.innerHTML = `Platnost: ${validFromDate.toLocaleString('cs-CZ', options)} - ${validToDate.toLocaleString('cs-CZ', options)}<br>Linky: ${item.affectedLines.join(', ')}`;

		// Vytvoření podrobností
		const details = document.createElement('p');
		details.style.display = 'none'; // Skryté podrobnosti
		details.innerHTML = `${item.publicTextHtml}`;
		
		const hrDelimiter = document.createElement('p');
		hrDelimiter.innerHTML = `<hr style="border: .5px solid #ddd;">`;

		// Přidání události kliknutí na nadpis
		header.onclick = function() {
			if (details.style.display === 'none') {
				details.style.display = 'block'; // Zobrazit podrobnosti
			} else {
				details.style.display = 'none'; // Skrýt podrobnosti
			}
		};
		validityInfo.onclick = function() {
			if (details.style.display === 'none') {
				details.style.display = 'block'; // Zobrazit podrobnosti
			} else {
				details.style.display = 'none'; // Skrýt podrobnosti
			}
		};

		// Přidání nadpisu, platnosti a podrobností do divu
		diversionItem.appendChild(header);
		diversionItem.appendChild(validityInfo);
		diversionItem.appendChild(details);
		diversionItem.appendChild(hrDelimiter);
		diversionsList.appendChild(diversionItem);
	});
}

document.getElementById("diversions-all").onclick = function() {
	document.getElementById("date-picker").value = ''; // Resetování výběru data
	document.getElementById("search-input").value = ''; // Resetování vyhledávání
	displayDiversions(diversionsData);
};

document.getElementById("diversions-current").onclick = function() {
	document.getElementById("date-picker").value = ''; // Resetování výběru data
	document.getElementById("search-input").value = ''; // Resetování vyhledávání
	const today = new Date();				
	const currentDiversions = diversionsData.filter(item => new Date(item.validFrom) <= today);
	displayDiversions(currentDiversions);
};

document.getElementById("diversions-future").onclick = function() {
	document.getElementById("date-picker").value = ''; // Resetování výběru data
	document.getElementById("search-input").value = ''; // Resetování vyhledávání
	const today = new Date();
	const futureDiversions = diversionsData.filter(item => new Date(item.validFrom) > today);
	displayDiversions(futureDiversions);
};

document.getElementById("date-picker").onchange = function() {
	document.getElementById("search-input").value = ''; // Resetování vyhledávání
	const selectedDateObj = new Date(this.value);
	const filteredDiversions = diversionsData.filter(item => {
		const validFrom = new Date(item.validFrom);
		const validTo = new Date(item.validTo);
		return validFrom <= selectedDateObj && validTo >= selectedDateObj;
	});
	displayDiversions(filteredDiversions);
};

// Přidání události pro vyhledávací pole
document.getElementById("search-input").addEventListener("input", function() {
	document.getElementById("date-picker").value = ''; // Resetování výběru data
	const searchTerm = this.value.toLowerCase();
	const filteredDiversions = diversionsData.filter(item => {
	   const titleMatch = item.title.toLowerCase().includes(searchTerm);
	   const bodyMatch = item.publicTextHtml.toLowerCase().includes(searchTerm);
	   const linesMatch = item.affectedLines.some(line => line.toLowerCase().includes(searchTerm));
	   return titleMatch || bodyMatch || linesMatch;
	});
	displayDiversions(filteredDiversions);
});