// convert HSL values to HEX color string
function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// return a human-readable color name from a hue value (0-360)
function getColorName(hue) {
  if (hue === null || hue === undefined) return 'Unknown';
  const h = ((hue % 360) + 360) % 360;
  if (h < 15 || h >= 345) return 'Red';
  if (h < 45) return 'Orange';
  if (h < 75) return 'Yellow';
  if (h < 150) return 'Green';
  if (h < 195) return 'Cyan';
  if (h < 255) return 'Blue';
  if (h < 285) return 'Indigo';
  if (h < 315) return 'Violet';
  if (h < 345) return 'Pink';
  return 'Red';
}

// calculate the angular distance between two hues on the color wheel
function calculateColorDistance(hue1, hue2) {
  const diff = Math.abs(hue1 - hue2) % 360;
  return diff > 180 ? 360 - diff : diff;
}

// filter an array of artworks by color similarity
function filterByColor(artworks, targetHue, tolerance = 30) {
  return artworks.filter(artwork => {
    const h = artwork.color?.h;
    if (h === null || h === undefined) return false;
    return calculateColorDistance(h, targetHue) <= tolerance;
  });
}

// parse a hex color string into HSL approximate values
function hexToHsl(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

module.exports = {
  hslToHex,
  getColorName,
  calculateColorDistance,
  filterByColor,
  hexToHsl
};