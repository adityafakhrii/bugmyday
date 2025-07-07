import BaseView from './base-view.js';

class AddView extends BaseView {
  constructor() {
    super();
    this.container = this.querySelector('#main-content');
    this.stream = null;
    this.capturedImageBlob = null;
    this.selectedLocation = null;
  }

  render() {
    return `
      <div class="content">
        <div class="add-story-container">
          <header>
            <h1 class="page-title">Share cerita bug lo</h1>
            <p class="page-subtitle">Biar orang lain ikut stress liat bug lo :)</p>
          </header>
          
          <form id="addStoryForm" class="add-story-form" role="form" aria-label="Form tambah cerita">
            <section class="form-group">
              <h2 class="form-label">
                <i class="fas fa-camera" aria-hidden="true"></i>
                Foto
              </h2>
              <div class="photo-input-container">
                <div id="cameraContainer" class="camera-container">
                  <video id="video" class="camera-video" style="display: none;" autoplay aria-label="Pratinjau kamera"></video>
                  <canvas id="canvas" class="camera-canvas" style="display: none;" aria-hidden="true"></canvas>
                  <div id="photoPreview" class="photo-preview" style="display: none;">
                    <img id="previewImage" alt="Pratinjau foto yang diambil" />
                  </div>
                  <div id="cameraControls" class="camera-controls">
                    <button type="button" id="startCamera" class="camera-button" aria-label="Buka kamera untuk mengambil foto">
                      <i class="fas fa-camera" aria-hidden="true"></i>
                      Buka Kamera
                    </button>
                    <button type="button" id="takePhoto" class="camera-button" style="display: none;" aria-label="Ambil foto">
                      <i class="fas fa-camera-retro" aria-hidden="true"></i>
                      Ambil Foto
                    </button>
                    <button type="button" id="retakePhoto" class="camera-button" style="display: none;" aria-label="Ambil foto ulang">
                      <i class="fas fa-redo" aria-hidden="true"></i>
                      Foto Ulang
                    </button>
                  </div>
                </div>
                <div class="file-input-container">
                  <input type="file" id="photo" name="photo" accept="image/*" class="file-input" aria-describedby="photo-help" />
                  <label for="photo" class="file-input-label">
                    <i class="fas fa-folder-open" aria-hidden="true"></i>
                    Atau pilih dari device
                  </label>
                  <small id="photo-help" class="sr-only">Pilih file gambar dari perangkat Anda</small>
                </div>
              </div>
            </section>

            <section class="form-group">
              <label for="description" class="form-label">
                <i class="fas fa-pen" aria-hidden="true"></i>
                Deskripsi
              </label>
              <textarea 
                id="description" 
                name="description" 
                class="form-textarea" 
                placeholder="Ceritain bug lo..."
                required
                minlength="5"
                maxlength="500"
                aria-describedby="char-counter"
              ></textarea>
              <small id="char-counter" class="char-counter">0/500 karakter</small>
            </section>

            <section class="form-group">
              <h3 class="form-label">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                Lokasi (Opsional)
              </h3>
              <div class="location-container">
                <div id="locationMap" class="location-map" role="img" aria-label="Peta untuk memilih lokasi"></div>
                <div class="location-controls">
                  <button type="button" id="getCurrentLocation" class="location-button" aria-label="Gunakan lokasi saat ini">
                    <i class="fas fa-crosshairs" aria-hidden="true"></i>
                    Pake Lokasi Sekarang
                  </button>
                  <button type="button" id="clearLocation" class="location-button secondary" aria-label="Hapus lokasi yang dipilih">
                    <i class="fas fa-times" aria-hidden="true"></i>
                    Hapus Lokasi
                  </button>
                </div>
                <div id="locationInfo" class="location-info" style="display: none;" role="status" aria-live="polite">
                  <span id="locationText"></span>
                </div>
              </div>
            </section>

            <div class="form-actions">
              <button type="button" id="cancelButton" class="form-button secondary" aria-label="Batalkan pembuatan cerita">
                <i class="fas fa-times" aria-hidden="true"></i>
                Batal
              </button>
              <button type="submit" id="submitButton" class="form-button primary" aria-label="Bagikan cerita">
                <i class="fas fa-share" aria-hidden="true"></i>
                Share Cerita
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  initializeCamera() {
    const video = this.getElementById('video');
    const canvas = this.getElementById('canvas');
    const startCameraBtn = this.getElementById('startCamera');
    const takePhotoBtn = this.getElementById('takePhoto');
    const retakePhotoBtn = this.getElementById('retakePhoto');
    const photoPreview = this.getElementById('photoPreview');
    const previewImage = this.getElementById('previewImage');

    this.addEventListener(startCameraBtn, 'click', async () => {
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        video.srcObject = this.stream;
        video.style.display = 'block';
        startCameraBtn.style.display = 'none';
        takePhotoBtn.style.display = 'inline-block';
      } catch (error) {
        console.error('Error accessing camera:', error);
        this.alert('Tidak dapat mengakses kamera. Silakan periksa izin kamera.');
      }
    });

    this.addEventListener(takePhotoBtn, 'click', () => {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        this.capturedImageBlob = blob;
        const url = URL.createObjectURL(blob);
        
        previewImage.src = url;
        photoPreview.style.display = 'block';
        video.style.display = 'none';
        takePhotoBtn.style.display = 'none';
        retakePhotoBtn.style.display = 'inline-block';
        
        this._stopCameraStream();
      }, 'image/jpeg', 0.8);
    });

    this.addEventListener(retakePhotoBtn, 'click', () => {
      photoPreview.style.display = 'none';
      retakePhotoBtn.style.display = 'none';
      startCameraBtn.style.display = 'inline-block';
      this.capturedImageBlob = null;
      
      if (previewImage.src) {
        URL.revokeObjectURL(previewImage.src);
      }
    });
  }

  initializeMap() {
    const map = L.map('locationMap').setView([-6.2088, 106.8456], 13);
    
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

    let currentMarker = null;

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      if (currentMarker) {
        map.removeLayer(currentMarker);
      }
      
      currentMarker = L.marker([lat, lng]).addTo(map);
      this.selectedLocation = { lat: lat, lng: lng };
      
      this._updateLocationInfo(lat, lng);
    });

    this.addEventListener(this.getElementById('getCurrentLocation'), 'click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            if (currentMarker) {
              map.removeLayer(currentMarker);
            }
            
            map.setView([latitude, longitude], 15);
            currentMarker = L.marker([latitude, longitude]).addTo(map);
            this.selectedLocation = { lat: latitude, lng: longitude };
            
            this._updateLocationInfo(latitude, longitude);
          },
          (error) => {
            console.error('Error getting location:', error);
            this.alert('Tidak dapat mendapatkan lokasi Anda. Silakan pilih secara manual di peta.');
          }
        );
      } else {
        this.alert('Geolokasi tidak didukung oleh browser ini.');
      }
    });

    this.addEventListener(this.getElementById('clearLocation'), 'click', () => {
      if (currentMarker) {
        map.removeLayer(currentMarker);
        currentMarker = null;
      }
      this.selectedLocation = null;
      this.getElementById('locationInfo').style.display = 'none';
    });
  }

  initializeForm() {
    const description = this.getElementById('description');
    const charCounter = this.querySelector('#char-counter');

    this.addEventListener(description, 'input', () => {
      const length = description.value.length;
      charCounter.textContent = `${length}/500 karakter`;
      
      if (length > 450) {
        charCounter.style.color = '#f97316';
      } else {
        charCounter.style.color = '#6b7280';
      }
    });
  }

  initializeFileInput() {
    const fileInput = this.getElementById('photo');
    const photoPreview = this.getElementById('photoPreview');
    const previewImage = this.getElementById('previewImage');

    this.addEventListener(fileInput, 'change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previewImage.src = e.target.result;
          photoPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  addFormSubmitHandler(onSubmit) {
    const form = this.getElementById('addStoryForm');
    if (form && onSubmit) {
      this.addEventListener(form, 'submit', async (e) => {
        e.preventDefault();
        
        const description = this.getElementById('description').value.trim();
        const fileInput = this.getElementById('photo');
        
        let photo = this.capturedImageBlob;
        if (!photo && fileInput.files[0]) {
          photo = fileInput.files[0];
        }

        const formData = {
          description,
          photo,
          location: this.selectedLocation
        };

        await onSubmit(formData);
      });
    }
  }

  addCancelHandler(onCancel) {
    const cancelButton = this.getElementById('cancelButton');
    if (cancelButton && onCancel) {
      this.addEventListener(cancelButton, 'click', onCancel);
    }
  }

  async resizeAndCompressImage(imageFile, maxWidth = 1024, maxHeight = 1024, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = this.document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          'image/jpeg',
          quality
        );
      };

      if (imageFile instanceof Blob) {
        img.src = URL.createObjectURL(imageFile);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.readAsDataURL(imageFile);
      }
    });
  }

  showSubmitLoading() {
    const submitButton = this.getElementById('submitButton');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Membagikan...';
    }
  }

  hideSubmitLoading() {
    const submitButton = this.getElementById('submitButton');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-share" aria-hidden="true"></i> Share Cerita';
    }
  }

  showSuccess(message) {
    this.alert(message);
  }

  showError(message) {
    this.alert(`Gagal membagikan cerita: ${message}`);
  }

  cleanup() {
    this._stopCameraStream();
    
    const previewImage = this.getElementById('previewImage');
    if (previewImage && previewImage.src) {
      URL.revokeObjectURL(previewImage.src);
    }
  }

  _stopCameraStream() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  _updateLocationInfo(lat, lng) {
    const locationInfo = this.getElementById('locationInfo');
    const locationText = this.getElementById('locationText');
    
    if (locationInfo && locationText) {
      locationText.innerHTML = `<i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      locationInfo.style.display = 'block';
    }
  }
}

export default AddView;