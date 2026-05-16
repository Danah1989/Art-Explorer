// search sidebar filter interactions
// handles color preset buttons and type filter buttons
(function () {
  const form = document.getElementById('filterForm');
  const colorHueHidden = document.getElementById('colorHueHidden');
  const typeIdHidden = document.getElementById('typeIdHidden');

  if (!form) return;

  // set initial active states from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlColorHue = urlParams.get('colorHue');
  const urlTypeId = urlParams.get('typeId');

  // clear any existing active states first
  document.querySelectorAll('.color-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelectorAll('.type-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // set active color button based on URL
  if (urlColorHue) {
    document.querySelectorAll('.color-filter-btn').forEach(btn => {
      if (btn.dataset.hue === urlColorHue) {
        btn.classList.add('active');
      }
    });
  }

  // set active type button based on URL
  if (urlTypeId) {
    document.querySelectorAll('.type-filter-btn').forEach(btn => {
      if (btn.dataset.typeId === urlTypeId) {
        btn.classList.add('active');
      }
    });
  }

  // color filter buttons
  document.querySelectorAll('.color-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const hue = btn.dataset.hue;
      const isActive = btn.classList.contains('active');

      // if clicking an active button, clear the filter
      if (isActive) {
        colorHueHidden.value = '';
      } else {
        // otherwise set to this hue
        colorHueHidden.value = hue;
        // update hidden type field to preserve other filters
      }

      form.submit();
    });
  });

  // type filter buttons
  document.querySelectorAll('.type-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const typeId = btn.dataset.typeId;
      const isActive = btn.classList.contains('active');

      if (isActive) {
        typeIdHidden.value = '';
      } else {
        typeIdHidden.value = typeId;
      }

      form.submit();
    });
  });
})();