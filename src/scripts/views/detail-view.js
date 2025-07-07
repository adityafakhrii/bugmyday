import BaseView from './base-view.js';

class DetailView extends BaseView {
  constructor() {
    super();
    this.container = this.querySelector('#main-content');
  }

  render() {
    return `
      <div class="content">
        <div class="detail-container">
          <div class="detail-loader">
            <div class="loader" role="status" aria-label="Memuat detail cerita"></div>
            <p>Memuat cerita...</p>
          </div>
        </div>
      </div>
    `;
  }

  showLoading() {
    const container = this.querySelector('.detail-container');
    if (container) {
      container.innerHTML = `
        <div class="detail-loader">
          <div class="loader" role="status" aria-label="Memuat detail cerita"></div>
          <p>Memuat cerita...</p>
        </div>
      `;
    }
  }

  displayStoryDetail(story) {
    const container = this.querySelector('.detail-container');
    if (!container) return;
    
    container.innerHTML = `
      <header class="detail-header">
        <button class="back-button" id="backButton" aria-label="Kembali ke halaman beranda">
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
          <span>Kembali ke Cerita</span>
        </button>
      </header>
      
      <article class="story-detail" role="article">
        <div class="story-detail-image">
          <img 
            src="${story.photoUrl}" 
            alt="Foto cerita oleh ${story.name}"
            loading="lazy"
          />
        </div>
        
        <div class="story-detail-content">
          <header class="story-detail-header">
            <div class="author-info">
              <h1 class="story-detail-author">
                <i class="fas fa-user" aria-hidden="true"></i>
                ${story.name}
              </h1>
              <time class="story-detail-date" datetime="${story.createdAt}">
                <i class="fas fa-clock" aria-hidden="true"></i>
                ${this._formatDate(story.createdAt)}
              </time>
              <button class="save-story-btn" data-story-id="${story.id}" 
                      aria-label="Simpan cerita ke favorit">
                <i class="fas fa-heart" aria-hidden="true"></i>
                Simpan
              </button>
            </div>
          </header>
          
          <section class="story-detail-description">
            <div class="story-detail-actions">
              <button class="save-story-btn" id="saveStoryBtn" data-story-id="${story.id}" 
                      aria-label="Simpan cerita ke favorit">
                <i class="fas fa-heart" aria-hidden="true"></i>
                Simpan ke Favorit
              </button>
            </div>
            
            <h2 class="sr-only">Deskripsi Cerita</h2>
            <p>${story.description}</p>
          </section>
          
          ${story.lat && story.lon ? `
            <section class="story-detail-location">
              <h2><i class="fas fa-map-marker-alt" aria-hidden="true"></i> Lokasi</h2>
              <div class="location-info">
                <i class="fas fa-map-pin location-icon" aria-hidden="true"></i>
                <span class="location-coordinates">
                  ${story.lat.toFixed(6)}, ${story.lon.toFixed(6)}
                </span>
              </div>
              <div id="detailMap" class="detail-map" role="img" aria-label="Peta menampilkan lokasi cerita"></div>
            </section>
          ` : ''}
        </div>
      </article>
    `;

    if (story.lat && story.lon) {
      this._initializeMap(story);
    }
  }

  addBackButtonHandler(onBackClick) {
    const backButton = this.getElementById('backButton');
    if (backButton && onBackClick) {
      this.addEventListener(backButton, 'click', onBackClick);
    }
  }

  addSaveStoryHandler(onSaveStory) {
    const saveButton = this.getElementById('saveStoryBtn');
    if (saveButton && onSaveStory) {
      this.addEventListener(saveButton, 'click', (e) => {
        const storyId = saveButton.dataset.storyId;
        if (storyId) {
          onSaveStory(storyId);
        }
      });
    }
  }

  showSuccess(message) {
    this.alert(message);
  }

  showError(message) {
    this.alert(message);
  }

  showError(message) {
    const container = this.querySelector('.detail-container');
    if (container) {
      container.innerHTML = `
        <div class="error-state" role="alert">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
          </div>
          <h1>Terjadi Kesalahan</h1>
          <p>${message}</p>
          <div class="error-actions">
            <button onclick="window.location.hash = '#/home'" class="retry-button"
                    aria-label="Kembali ke halaman beranda">
              <i class="fas fa-home" aria-hidden="true"></i>
              Kembali ke Beranda
            </button>
            <button onclick="location.reload()" class="retry-button secondary"
                    aria-label="Coba muat ulang halaman">
              <i class="fas fa-redo" aria-hidden="true"></i>
              Coba Lagi
            </button>
          </div>
        </div>
      `;
    }
  }

  _initializeMap(story) {
    const map = L.map('detailMap').setView([story.lat, story.lon], 15);
    
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
    });

    const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    });

    osmLayer.addTo(map);

    const baseLayers = {
      'OpenStreetMap': osmLayer,
      'Satelit': satelliteLayer,
      'CartoDB Light': cartoLayer
    };

    L.control.layers(baseLayers).addTo(map);

    const marker = L.marker([story.lat, story.lon]).addTo(map);
    
    marker.bindPopup(`
      <div class="popup-content">
        <h3><i class="fas fa-user" aria-hidden="true"></i> ${story.name}</h3>
        <p>${story.description}</p>
        <small><i class="fas fa-clock" aria-hidden="true"></i> ${this._formatDate(story.createdAt)}</small>
      </div>
    `).openPopup();
  }

  _formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export default DetailView;