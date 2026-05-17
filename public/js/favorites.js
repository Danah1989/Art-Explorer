// artwork card save/unsave via ajax
class FavoritesManager {
  constructor() {
    this.init();
    this.dispatchEvents = true; // enable custom events for class comm
  }

  init() {
    document.addEventListener('click', (e) => this.handleSaveClick(e));
  }

  // handle click on any save button across the page
  async handleSaveClick(e) {
    const btn = e.target.closest('.card-save-btn[data-artwork-id]');
    if (!btn || btn.tagName === 'A') return;

    e.preventDefault();

    // if already saved, redirect to detail page to manage it
    if (btn.classList.contains('saved')) {
      window.location.href = `/art/detail/${btn.dataset.artworkId}`;
      return;
    }

    await this.saveArtwork(btn);
  }

  // send ajax request to save an artwork to favorites
  async saveArtwork(btn) {
    btn.disabled = true;
    btn.textContent = '…';

    try {
      const body = this.buildRequestBody(btn);

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
        this.markAsSaved(btn);
        // notify other classes that favorites changed
        this.emitFavoritesChanged('add', btn.dataset.artworkId);
      } else {
        this.resetButton(btn);
        console.error('Save failed:', data.message);
      }
    } catch (err) {
      this.resetButton(btn);
      console.error('Save error:', err);
    } finally {
      btn.disabled = false;
    }
  }

  // build the post body from button data attributes
  buildRequestBody(btn) {
    return new URLSearchParams({
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
  }

  // update button ui to reflect saved state
  markAsSaved(btn) {
    btn.classList.add('saved');
    btn.innerHTML = '♥';
    btn.title = 'Saved to gallery';
  }

  // reset button ui on failure
  resetButton(btn) {
    btn.innerHTML = '♡';
  }

  // dispatch custom event for other classes to listen
  emitFavoritesChanged(action, artworkId) {
    if (!this.dispatchEvents) return;
    document.dispatchEvent(new CustomEvent('favoritesChanged', {
      detail: { action, artworkId }
    }));
  }
}

// initialize
new FavoritesManager();