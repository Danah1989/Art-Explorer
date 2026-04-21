// Color search page interactive controls
(function () {
  const colorPicker = document.getElementById('colorPicker');
  const colorPreview = document.getElementById('colorPreview');
  const hexInput = document.getElementById('hexInput');
  const hueInput = document.getElementById('hueInput');
  const hueSlider = document.getElementById('hueSlider');
  const hueDisplay = document.getElementById('hueDisplay');
  const toleranceSlider = document.getElementById('toleranceSlider');
  const toleranceDisplay = document.getElementById('toleranceDisplay');
  const hueSelectedColor = document.getElementById('hueSelectedColor');

  if (!colorPicker) return;

  // convert hex color to hue value (0-360)
  function hexToHue(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    if (max !== min) {
      const d = max - min;
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return Math.round(h * 360);
  }

  // convert hue value to preview hex color
  function hueToHex(hue) {
    const s = 0.7;
    const l = 0.55;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (hue < 60) { r = c; g = x; b = 0; }
    else if (hue < 120) { r = x; g = c; b = 0; }
    else if (hue < 180) { r = 0; g = c; b = x; }
    else if (hue < 240) { r = 0; g = x; b = c; }
    else if (hue < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    const toHex = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // update all UI elements when hex color changes
  function updateFromHex(hex) {
    colorPreview.style.background = hex;
    if (hueSelectedColor) hueSelectedColor.style.background = hex;
    hexInput.value = hex;
    const hue = hexToHue(hex);
    hueInput.value = hue;
    hueSlider.value = hue;
    if (hueDisplay) hueDisplay.textContent = hue;
  }

  // update all UI elements when hue value changes
  function updateFromHue(hue) {
    hueInput.value = hue;
    if (hueDisplay) hueDisplay.textContent = hue;
    hueSlider.value = hue;
    const hex = hueToHex(parseInt(hue));
    colorPicker.value = hex;
    colorPreview.style.background = hex;
    if (hueSelectedColor) hueSelectedColor.style.background = hex;
    hexInput.value = hex;
  }

  // color picker input handler
  colorPicker.addEventListener('input', () => updateFromHex(colorPicker.value));

  // hue slider handler
  hueSlider.addEventListener('input', () => updateFromHue(hueSlider.value));

  // tolerance slider handler
  toleranceSlider.addEventListener('input', () => {
    if (toleranceDisplay) toleranceDisplay.textContent = toleranceSlider.value;
  });

  // preset color dot click handlers
  document.querySelectorAll('.preset-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const hue = parseInt(dot.dataset.hue);
      updateFromHue(hue);
    });
  });

  // initialize with default color
  updateFromHex(colorPicker.value);
})();