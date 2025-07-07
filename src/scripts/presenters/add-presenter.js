import StoryModel from '../models/story-model.js';

class AddPresenter {
  constructor(view) {
    this.view = view;
    this.model = new StoryModel();
  }

  async init() {
    this.view.initializeCamera();
    this.view.initializeMap();
    this.view.initializeForm();
    this.view.initializeFileInput();
  }

  async handleFormSubmit(formData) {
    try {
      this.view.showSubmitLoading();

      const { description, photo, location } = formData;

      if (!photo) {
        throw new Error('Silakan ambil foto atau pilih file gambar.');
      }

      if (!description || description.trim().length === 0) {
        throw new Error('Silakan masukkan deskripsi untuk cerita Anda.');
      }

      const compressedPhoto = await this.view.resizeAndCompressImage(photo);
      
      const token = this.model.storage.getItem('token');
      let response;

      if (token) {
        response = await this.model.createStory(
          description,
          compressedPhoto,
          location ? location.lat : null,
          location ? location.lng : null
        );
      } else {
        response = await this.model.createGuestStory(
          description,
          compressedPhoto,
          location ? location.lat : null,
          location ? location.lng : null
        );
      }

      this.view.showSuccess('Cerita berhasil dibagikan!');
      this.view.navigateTo('#/home');
    } catch (error) {
      console.error('Error in AddPresenter:', error);
      this.view.showError(error.message);
    } finally {
      this.view.hideSubmitLoading();
    }
  }

  handleCancel() {
    if (this.view.confirm('Apakah Anda yakin ingin membatalkan? Semua perubahan akan hilang.')) {
      this.view.cleanup();
      this.view.navigateTo('#/home');
    }
  }
}

export default AddPresenter;