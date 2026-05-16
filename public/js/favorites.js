// artwork card save/unsave functionality via AJAX
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.card-save-btn[data-artwork-id]');
  if (!btn || btn.tagName === 'A') return;

  e.preventDefault();
  const isSaved = btn.classList.contains('saved');

  // for unsave, redirect to detail page since we need the favorite ID
  if (isSaved) {
    window.location.href = `/art/detail/${btn.dataset.artworkId}`;
    return;
  }

  // save artwork via AJAX
  btn.disabled = true;
  btn.textContent = '…';

  try {
    const body = new URLSearchParams({
      artworkId: btn.dataset.artworkId,
      title: btn.dataset.title,
      artist: btn.dataset.artist,
      imageId: btn.dataset.imageId,
      dateDisplay: btn.dataset.date,
      medium: btn.dataset.medium,
      colorH: btn.dataset.colorH,
      colorS: btn.dataset.colorS,
      colorL: btn.dataset.colorL,
      notes: '',
      colorTags: ''
    });

    const res = await fetch('/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: body.toString()
    });

    const data = await res.json();

    if (data.success || res.status === 409) {
      btn.classList.add('saved');
      btn.textContent = '♥';
      btn.title = 'Saved to gallery';
    } else {
      btn.textContent = '♡';
      console.error('Save failed:', data.message);
    }
  } catch (err) {
    btn.textContent = '♡';
    console.error('Save error:', err);
  } finally {
    btn.disabled = false;
  }
});