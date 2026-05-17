// search sidebar filters: color and type buttons
class SearchFilters {
  constructor() {
    this.form = document.getElementById('filterForm');
    this.colorHueHidden = document.getElementById('colorHueHidden');
    this.typeIdHidden = document.getElementById('typeIdHidden');

    if (!this.form) return;

    this.urlParams = new URLSearchParams(window.location.search);
    this.init();
  }

  init() {
    this.restoreActiveStates();
    this.initColorButtons();
    this.initTypeButtons();
  }

  // restore active button states from current url parameters
  restoreActiveStates() {
    const urlColorHue = this.urlParams.get('colorHue');
    const urlTypeId = this.urlParams.get('typeId');

    document.querySelectorAll('.color-filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (urlColorHue && btn.dataset.hue === urlColorHue) {
        btn.classList.add('active');
      }
    });

    document.querySelectorAll('.type-filter-btn').forEach(btn => {
      btn.classList.remove('active');
      if (urlTypeId && btn.dataset.typeId === urlTypeId) {
        btn.classList.add('active');
      }
    });
  }

  // color filter button click handlers
  initColorButtons() {
    document.querySelectorAll('.color-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isActive = btn.classList.contains('active');
        // toggle off if already active, otherwise apply filter
        this.colorHueHidden.value = isActive ? '' : btn.dataset.hue;
        // notify other classes that filter changed
        this.emitFilterApplied('color', this.colorHueHidden.value);
        this.form.submit();
      });
    });
  }

  // artwork type filter button click handlers
  initTypeButtons() {
    document.querySelectorAll('.type-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isActive = btn.classList.contains('active');
        // toggle off if already active, otherwise apply filter
        this.typeIdHidden.value = isActive ? '' : btn.dataset.typeId;
        // notify other classes that filter changed
        this.emitFilterApplied('type', this.typeIdHidden.value);
        this.form.submit();
      });
    });
  }

  // dispatch custom event for other classes to listen
  emitFilterApplied(type, value) {
    document.dispatchEvent(new CustomEvent('filterApplied', {
      detail: { type, value }
    }));
  }
}

// initialize
new SearchFilters();