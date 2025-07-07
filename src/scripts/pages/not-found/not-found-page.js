const NotFound = {
  async render() {
    return `
      <div class="content">
        <div class="not-found-container">
          <div class="not-found-content">
            <div class="not-found-icon">
              <i class="fas fa-bug" aria-hidden="true"></i>
              <span class="error-code">404</span>
            </div>
            
            <h1 class="not-found-title">Halaman Tidak Ditemukan</h1>
            <p class="not-found-description">
              Ups! Sepertinya halaman yang Anda cari tidak ada atau telah dipindahkan. 
              Mungkin ada bug di URL yang Anda masukkan? 🐛
            </p>
            
            <div class="not-found-suggestions">
              <h2>Yang bisa Anda lakukan:</h2>
              <ul>
                <li>Periksa kembali URL yang Anda masukkan</li>
                <li>Kembali ke halaman beranda</li>
                <li>Gunakan navigasi untuk mencari halaman yang Anda inginkan</li>
                <li>Atau langsung tambah cerita bug baru!</li>
              </ul>
            </div>
            
            <div class="not-found-actions">
              <a href="#/home" class="cta-button" aria-label="Kembali ke halaman beranda">
                <i class="fas fa-home" aria-hidden="true"></i>
                Kembali ke Beranda
              </a>
              <a href="#/add" class="cta-button secondary" aria-label="Tambah cerita baru">
                <i class="fas fa-plus" aria-hidden="true"></i>
                Tambah Cerita
              </a>
            </div>
            
            <div class="not-found-footer">
              <p>
                <i class="fas fa-lightbulb" aria-hidden="true"></i>
                Tips: Gunakan menu navigasi di atas untuk menjelajahi aplikasi
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    // Focus on the main heading for accessibility
    const title = document.querySelector('.not-found-title');
    if (title) {
      title.focus();
    }
  },
};

export default NotFound;