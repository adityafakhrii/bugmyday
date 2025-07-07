import BaseView from './base-view.js';

class FavoritesView extends BaseView {
  constructor() {
    super();
    this.container = this.querySelector('#main-content');
  }

  render() {
    return `
      <div class="content">
        <div class="favorites-container">
          <header class="favorites-header">
            <h1 class="page-title">Cerita Favorit</h1>
            <p class="page-subtitle">Cerita-cerita yang sudah Anda simpan untuk dibaca nanti</p>
            <div class="favorites-actions">
              <button id="clearAllFavorites" class="form-button secondary" style="display: none;">
                <i class="fas fa-trash" aria-hidden="true"></i>
                Hapus Semua
              </button>
            </div>
          </header>
          
          <section id="favoritesContent" class="favorites-content" role="main" aria-label="Daftar cerita favorit">
            <div class="story-loader">
              <div class="loader" role="status" aria-label="Memuat cerita favorit"></div>
              <p>Memuat cerita favorit...</p>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  showLoading() {
    const content = this.querySelector('#favoritesContent');
    if (content) {
      content.innerHTML = `
        <div class="story-loader">
          <div class="loader" role="status" aria-label="Memuat cerita favorit"></div>
          <p>Memuat cerita favorit...</p>
        </div>
      `;
    }
  }

  displayFavorites(favorites) {
    const content = this.querySelector('#favoritesContent');
    const clearAllBtn = this.getElementById('clearAllFavorites');
    
    if (!content) return;

    if (favorites.length === 0) {
      content.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-heart" aria-hidden="true"></i>
          </div>
          <h2>Belum ada cerita favorit</h2>
          <p>Mulai tambahkan cerita ke favorit dengan menekan tombol hati pada cerita yang Anda suka!</p>
          <a href="#/home" class="cta-button" aria-label="Lihat semua cerita">
            <i class="fas fa-home" aria-hidden="true"></i>
            Lihat Semua Cerita
          </a>
        </div>
      `;
      
      if (clearAllBtn) {
        clearAllBtn.style.display = 'none';
      }
      return;
    }

    if (clearAllBtn) {
      clearAllBtn.style.display = 'inline-flex';
    }

    content.innerHTML = `
      <div class="stories">
        ${favorites.map(story => `
          <article class="story-item favorite-item" data-story-id="${story.id}" role="article" tabindex="0" 
                   aria-label="Cerita favorit oleh ${story.name}: ${this._truncateText(story.description, 50)}">
            <div class="story-image">
              <img 
                src="${story.photoUrl}" 
                alt="Foto cerita oleh ${story.name}"
                loading="lazy"
              />
              <div class="favorite-badge">
                <i class="fas fa-heart" aria-hidden="true"></i>
              </div>
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
              <div class="favorite-info">
                <small>
                  <i class="fas fa-heart" aria-hidden="true"></i>
                  Ditambahkan ${this._formatDate(story.addedAt)}
                </small>
              </div>
              <div class="story-actions">
                <button class="view-detail-btn" data-story-id="${story.id}" 
                        aria-label="Lihat detail cerita oleh ${story.name}">
                  <i class="fas fa-eye" aria-hidden="true"></i>
                  Lihat Detail
                </button>
                <button class="remove-favorite-btn" data-story-id="${story.id}" 
                        aria-label="Hapus dari favorit">
                  <i class="fas fa-heart-broken" aria-hidden="true"></i>
                  Hapus
                </button>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  addStoryClickHandlers(onStoryClick) {
    this.querySelectorAll('.story-item').forEach(item => {
      const clickHandler = (e) => {
        if (e.target.classList.contains('view-detail-btn') || 
            e.target.closest('.view-detail-btn') ||
            e.target.classList.contains('remove-favorite-btn') || 
            e.target.closest('.remove-favorite-btn')) return;
        
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

  addRemoveFavoriteHandlers(onRemoveFavorite) {
    this.querySelectorAll('.remove-favorite-btn').forEach(btn => {
      const clickHandler = (e) => {
        e.stopPropagation();
        const storyId = btn.dataset.storyId;
        if (storyId && onRemoveFavorite) {
          if (this.confirm('Apakah Anda yakin ingin menghapus cerita ini dari favorit?')) {
            onRemoveFavorite(storyId);
          }
        }
      };

      this.addEventListener(btn, 'click', clickHandler);
    });
  }

  addClearAllHandler(onClearAll) {
    const clearAllBtn = this.getElementById('clearAllFavorites');
    if (clearAllBtn && onClearAll) {
      this.addEventListener(clearAllBtn, 'click', () => {
        if (this.confirm('Apakah Anda yakin ingin menghapus semua cerita favorit?')) {
          onClearAll();
        }
      });
    }
  }

  showError(message) {
    const content = this.querySelector('#favoritesContent');
    if (content) {
      content.innerHTML = `
        <div class="error-state" role="alert">
          <div class="error-icon">
            <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
          </div>
          <h2>Terjadi Kesalahan</h2>
          <p>${message}</p>
          <button onclick="location.reload()" class="retry-button" aria-label="Coba muat ulang halaman">
            <i class="fas fa-redo" aria-hidden="true"></i>
            Coba Lagi
          </button>
        </div>
      `;
    }
  }

  showSuccess(message) {
    this.alert(message);
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

export default FavoritesView;