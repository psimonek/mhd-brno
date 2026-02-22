function setSvgFillById(id, hexColor) {
    const svg = document.getElementById(id);
    if (!svg) return false;
    svg.style.fill = hexColor;
    return true;
}
function setBackgroundById(id, hexColor) {
    const svg = document.getElementById(id);
    if (!svg) return false;
    svg.style.background = hexColor;
    return true;
}
