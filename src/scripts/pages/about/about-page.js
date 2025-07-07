const About = {
  async render() {
    return `
      <div class="content">
        <div class="about-container">
          <header class="about-hero">
            <h1>Tentang DebugMyDay</h1>
            <p class="about-subtitle">Platform buat share cerita bug yang lo temuin biar gak stress sendiri</p>
          </header>
          
          <div class="about-content">
            <section class="about-section">
              <h2><i class="fas fa-question-circle"></i> Apa itu DebugMyDay?</h2>
              <p>
                DebugMyDay adalah platform sosial di mana Anda dapat berbagi momen harian, 
                pengalaman, dan cerita dengan komunitas pembelajar dan pengembang. 
                Mirip seperti Instagram namun dirancang khusus untuk komunitas Dicoding.
              </p>
            </section>

            <section class="about-section">
              <h2><i class="fas fa-star"></i> Fitur</h2>
              <ul class="feature-list">
                <li><i class="fas fa-camera"></i> Share cerita pake foto dengan deskripsi</li>
                <li><i class="fas fa-map-marker-alt"></i> Tambahkan lokasi ke cerita</li>
                <li><i class="fas fa-globe"></i> Cari cerita di peta interaktif</li>
                <li><i class="fas fa-mobile-alt"></i> Desain responsif buat semua perangkat</li>
                <li><i class="fas fa-universal-access"></i> UI yang fokus pada aksesibilitas</li>
                <li><i class="fas fa-user-friends"></i> Mode tamu buat share tanpa login</li>
              </ul>
            </section>

            <section class="about-section">
              <h2><i class="fas fa-book-open"></i> Cara Menggunakan</h2>
              <ol class="steps-list">
                <li>Daftar akun baru atau masuk (atau tanpa login)</li>
                <li>Ambil foto pakai kamera atau upload dari device</li>
                <li>Tambah deskripsi untuk cerita</li>
                <li>Opsional: tambahkan lokasi</li>
                <li>Bagikan cerita bug</li>
                <li>Liat-liat cerita lain di halaman beranda dan peta</li>
              </ol>
            </section>
            
            <section class="about-section">
              <h2><i class="fas fa-envelope"></i> Kontak & Dukungan</h2>
              <p>
                Aplikasi ini dibuat untuk submission Dicoding. Punya pertanyaan atau butuh bantuan? langsung cek forum diskusi di Dicoding atau hubungi support via situs resminya.
              </p>
              <div class="contact-links">
                <a href="https://dicoding.com" target="_blank" rel="noopener noreferrer" class="contact-link">
                  <i class="fas fa-external-link-alt"></i>
                  Kunjungi Dicoding
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    `;
  },

  async afterRender() {
  },
};

export default About;