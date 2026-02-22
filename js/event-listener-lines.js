document.querySelectorAll('.group-content a').forEach(function(link) {
    link.addEventListener('click', function(event) {
        event.preventDefault(); // Zabráníme výchozímu chování odkazu
        linkaCislo = this.getAttribute('data-line'); // Získáme číslo linky
        linkaCisloFiltr = linkaCislo;
        loadLinesAndStops(linkaCislo); // Vyvoláme funkci s číslem linky
    	});
});