import BaseView from './base-view.js';

class HomeView extends BaseView {
  constructor() {
    super();
    this.container = this.querySelector('#main-content');
  }

  render() {
    return `
      <div class="hero">
        <div class="hero-inner">
          <h1 class="hero-title">Share Cerita Bug Lo!</h1>
          <p class="hero-tagline">Lagi nyari bug? Share disini biar gak stress!</p>
        </div>
      </div>
      
      <div class="content">
        <div class="explore">
          <div id="mapContainer" class="map-container-wrapper">
            <div id="map" class="map-container" role="img" aria-label="Peta interaktif menampilkan lokasi cerita"></div>
          </div>
          <section id="stories" class="stories" role="main" aria-label="Daftar cerita">
            <h2 class="sr-only">Cerita Terbaru</h2>
            <div class="story-loader">
              <div class="loader" role="status" aria-label="Memuat cerita"></div>
              <p>Memuat cerita...</p>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  showLoading() {
    const storiesContainer = this.querySelector('#stories');
    if (storiesContainer) {
      storiesContainer.innerHTML = `
        <h2 class="sr-only">Cerita Terbaru</h2>
        <div class="story-loader">
          <div class="loader" role="status" aria-label="Memuat cerita"></div>
          <p>Memuat cerita...</p>
        </div>
      `;
    }
  }

  showGuestMessage() {
    const mapContainer = this.getElementById('mapContainer');
    if (mapContainer) {
      mapContainer.style.display = 'none';
    }

    const storiesContainer = this.querySelector('#stories');
    if (storiesContainer) {
      storiesContainer.innerHTML = `
        <h2 class="sr-only">Selamat Datang</h2>
        <div class="guest-message">
          <div class="guest-icon">
            <i class="fas fa-user-friends" aria-hidden="true"></i>
          </div>
          <h3>Selamat Datang di DebugMyDay!</h3>
          <p>Buat liat-liat cerita bug orang lain, login dulu yak! <br> atau kalo lo mau share langsung cerita bug lo, bisa langsung aja sih tanpa login:) </p>
          <div class="guest-actions">
            <a href="#/auth" class="cta-button" aria-label="Masuk atau daftar akun baru">
              <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
              Masuk / Daftar
            </a>
            <a href="#/add" class="cta-button secondary" aria-label="Tambah cerita tanpa login">
              <i class="fas fa-plus" aria-hidden="true"></i>
              Tambah Cerita tanpa login
            </a>
          </div>
        </div>
      `;
    }
  }

  displayStories(stories) {
    const storiesContainer = this.querySelector('#stories');
    
    if (!storiesContainer) return;

    if (stories.length === 0) {
      storiesContainer.innerHTML = `
        <h2 class="sr-only">Cerita Kosong</h2>
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-images" aria-hidden="true"></i>
          </div>
          <h3>Belum ada cerita</h3>
          <p>Jadilah yang pertama membagikan cerita Anda!</p>
          <a href="#/add" class="cta-button" aria-label="Tambah cerita baru">
            <i class="fas fa-plus" aria-hidden="true"></i>
            Tambah Cerita
          </a>
        </div>
      `;
      return;
    }

    storiesContainer.innerHTML = `
      <h2 class="sr-only">Cerita Terbaru</h2>
      ${stories.map(story => `
        <article class="story-item" data-story-id="${story.id}" role="article" tabindex="0" 
                 aria-label="Cerita oleh ${story.name}: ${this._truncateText(story.description, 50)}">
          <div class="story-image">
            <img 
              src="${story.photoUrl}" 
              alt="Foto cerita oleh ${story.name}"
              loading="lazy"
            />
          </div>
          <div class="story-content">
            <div class="story-header">
              <h3 class="story-author">
                <i class="fas fa-user" aria-hidden="true"></i>
                ${story.name}
              </h3>
              <time class="story-date" datetime="${story.createdAt}">
                <i class="fas fa-clock" aria-hidden="true"></i>
                ${this._formatDate(story.createdAt)}
              </time>
            </div>
            <p class="story-description">${this._truncateText(story.description, 150)}</p>
            ${story.lat && story.lon ? `
              <div class="story-location">
                <i class="fas fa-map-marker-alt location-icon" aria-hidden="true"></i>
                <span class="location-text">Lokasi: ${story.lat.toFixed(4)}, ${story.lon.toFixed(4)}</span>
              </div>
            ` : ''}
            <div class="story-actions">
              <button class="view-detail-btn" data-story-id="${story.id}" 
                      aria-label="Lihat detail cerita oleh ${story.name}">
                <i class="fas fa-eye" aria-hidden="true"></i>
                Lihat Detail
              </button>
              <button class="save-story-btn" data-story-id="${story.id}" 
                      aria-label="Simpan cerita ke favorit">
                <i class="fas fa-heart" aria-hidden="true"></i>
                Simpan
              </button>
            </div>
          </div>
        </article>
      `).join('')}
    `;
  }

  displayStoriesOnMap(stories) {
    const map = this.window.storyMap;
    if (!map) return;
    
    stories.forEach(story => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        
        marker.bindPopup(`
          <div class="popup-content">
            <img src="${story.photoUrl}" alt="Foto oleh ${story.name}" class="popup-image" />
            <h4><i class="fas fa-user" aria-hidden="true"></i> ${story.name}</h4>
            <p>${this._truncateText(story.description, 100)}</p>
            <small><i class="fas fa-clock" aria-hidden="true"></i> ${this._formatDate(story.createdAt)}</small>
            <br>
            <button onclick="window.location.hash = '#/detail/${story.id}'" class="popup-detail-btn"
                    aria-label="Lihat detail cerita oleh ${story.name}">
              <i class="fas fa-eye" aria-hidden="true"></i>
              Lihat Detail
            </button>
          </div>
        `);
      }
    });
  }

  showError(message) {
    const storiesContainer = this.querySelector('#stories');
    if (storiesContainer) {
      storiesContainer.innerHTML = `
        <h2 class="sr-only">Terjadi Kesalahan</h2>
        <div class="error-state" role="alert">
          <div class="error-icon">
            <i class="fas fa-wifi" aria-hidden="true"></i>
          </div>
          <h3>Mode Offline</h3>
          <p>${message}</p>
          <div class="offline-actions">
            <button onclick="location.reload()" class="retry-button" aria-label="Coba muat ulang halaman">
              <i class="fas fa-redo" aria-hidden="true"></i>
              Coba Lagi
            </button>
            <a href="#/add" class="retry-button secondary" aria-label="Tambah cerita offline">
              <i class="fas fa-plus" aria-hidden="true"></i>
              Tambah Cerita
            </a>
          </div>
        </div>
      `;
    }
  }

  showSuccess(message) {
    this.alert(message);
  }

  initializeMap() {
    const map = L.map('map').setView([-6.2088, 106.8456], 10);
    
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      name: 'OpenStreetMap'
    });

    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
      name: 'Satelit'
    });

    const cartoLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      name: 'CartoDB Light'
    });

    osmLayer.addTo(map);

    const baseLayers = {
      'OpenStreetMap': osmLayer,
      'Satelit': satelliteLayer,
      'CartoDB Light': cartoLayer
    };

    L.control.layers(baseLayers).addTo(map);

    this.window.storyMap = map;
  }

  addStoryClickHandlers(onStoryClick) {
    this.querySelectorAll('.story-item').forEach(item => {
      const clickHandler = (e) => {
        if (e.target.classList.contains('view-detail-btn') || e.target.closest('.view-detail-btn') ||
            e.target.classList.contains('save-story-btn') || e.target.closest('.save-story-btn')) return;
        
        const storyId = item.dataset.storyId;
        if (storyId && onStoryClick) {
          onStoryClick(storyId);
        }
      };

      this.addEventListener(item, 'click', clickHandler);
      this.addEventListener(item, 'keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          clickHandler(e);
        }
      });

      item.style.cursor = 'pointer';
    });

    this.querySelectorAll('.view-detail-btn').forEach(btn => {
      const clickHandler = (e) => {
        e.stopPropagation();
        const storyId = btn.dataset.storyId;
        if (storyId && onStoryClick) {
          onStoryClick(storyId);
        }
      };

      this.addEventListener(btn, 'click', clickHandler);
    });
  }

  addSaveStoryHandlers(onSaveStory) {
    this.querySelectorAll('.save-story-btn').forEach(btn => {
      const clickHandler = (e) => {
        e.stopPropagation();
        const storyId = btn.dataset.storyId;
        if (storyId && onSaveStory) {
          onSaveStory(storyId);
        }
      };

      this.addEventListener(btn, 'click', clickHandler);
    });
  }

  _truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  _formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export default HomeView;