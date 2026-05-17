// Color search page interactive controls

class ColorPicker {
  constructor() {
    this.colorPicker = document.getElementById('colorPicker');
    this.colorPreview = document.getElementById('colorPreview');
    this.hexInput = document.getElementById('hexInput');
    this.hueInput = document.getElementById('hueInput');
    this.hueSlider = document.getElementById('hueSlider');
    this.hueDisplay = document.getElementById('hueDisplay');
    this.toleranceSlider = document.getElementById('toleranceSlider');
    this.toleranceDisplay = document.getElementById('toleranceDisplay');
    this.hueSelectedColor = document.getElementById('hueSelectedColor');

    if (!this.colorPicker) return;

    this.init();
  }

  init() {
    this.colorPicker.addEventListener('input', () => this.updateFromHex(this.colorPicker.value));
    this.hueSlider.addEventListener('input', () => this.updateFromHue(this.hueSlider.value));

    if (this.toleranceSlider) {
      this.toleranceSlider.addEventListener('input', () => {
        if (this.toleranceDisplay) {
          this.toleranceDisplay.textContent = this.toleranceSlider.value;
        }
      });
    }

    document.querySelectorAll('.preset-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        this.updateFromHue(parseInt(dot.dataset.hue));
      });
    });

    // initialize with the default picker value
    this.updateFromHex(this.colorPicker.value);
  }

  // convert hex color string to hue value (0-360)
  hexToHue(hex) {
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

  // convert hue value (0-360) to a representative hex color for preview
  hueToHex(hue) {
    const s = 0.7;
    const l = 0.55;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (hue < 60)       { r = c; g = x; b = 0; }
    else if (hue < 120) { r = x; g = c; b = 0; }
    else if (hue < 180) { r = 0; g = c; b = x; }
    else if (hue < 240) { r = 0; g = x; b = c; }
    else if (hue < 300) { r = x; g = 0; b = c; }
    else                { r = c; g = 0; b = x; }
    const toHex = v => Math.round((v + m) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // sync all UI elements when the hex color picker changes
  updateFromHex(hex) {
    this.colorPreview.style.background = hex;
    if (this.hueSelectedColor) this.hueSelectedColor.style.background = hex;
    this.hexInput.value = hex;
    const hue = this.hexToHue(hex);
    this.hueInput.value = hue;
    this.hueSlider.value = hue;
    if (this.hueDisplay) this.hueDisplay.textContent = hue;
  }

  // sync all UI elements when the hue slider or preset changes
  updateFromHue(hue) {
    this.hueInput.value = hue;
    if (this.hueDisplay) this.hueDisplay.textContent = hue;
    this.hueSlider.value = hue;
    const hex = this.hueToHex(parseInt(hue));
    this.colorPicker.value = hex;
    this.colorPreview.style.background = hex;
    if (this.hueSelectedColor) this.hueSelectedColor.style.background = hex;
    this.hexInput.value = hex;
  }
}

new ColorPicker();