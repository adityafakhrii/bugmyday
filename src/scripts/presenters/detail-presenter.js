import StoryModel from '../models/story-model.js';
import IndexedDBModel from '../models/indexeddb-model.js';

class DetailPresenter {
  constructor(view) {
    this.view = view;
    this.model = new StoryModel();
    this.indexedDB = new IndexedDBModel();
  }

  async init(storyId) {
    try {
      const token = this.model.storage.getItem('token');
      if (!token) {
        this.view.navigateTo('#/auth');
        return;
      }

      if (!storyId) {
        this.view.showError('Cerita tidak ditemukan');
        return;
      }

      this.view.showLoading();
      
      const response = await this.model.getStoryById(storyId);
      const story = this.model.getCurrentStoryData();
      
      this.view.displayStoryDetail(story);
    } catch (error) {
      console.error('Error in DetailPresenter:', error);
      this.view.showError(error.message);
    }
  }

  handleBackClick() {
    this.view.navigateTo('#/home');
  }

  async handleSaveStory(storyId) {
    try {
      const story = this.model.getCurrentStoryData();
      
      if (!story) {
        this.view.showError('Data cerita tidak ditemukan');
        return;
      }

      await this.indexedDB.init();
      await this.indexedDB.addToFavorites(story);
      
      this.view.showSuccess('Cerita berhasil disimpan ke favorit!');
    } catch (error) {
      console.error('Error saving story:', error);
      if (error.message && error.message.includes('already exists')) {
        this.view.showError('Cerita sudah ada di favorit');
      } else {
        this.view.showError('Gagal menyimpan cerita ke favorit');
      }
    }
  }
}

export default DetailPresenter;