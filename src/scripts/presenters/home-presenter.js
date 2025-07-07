import StoryModel from '../models/story-model.js';
import IndexedDBModel from '../models/indexeddb-model.js';

class HomePresenter {
  constructor(view) {
    this.view = view;
    this.model = new StoryModel();
    this.indexedDB = new IndexedDBModel();
  }

  async init() {
    try {
      this.view.showLoading();
      
      const token = this.model.storage.getItem('token');
      
      if (!token) {
        this.view.showGuestMessage();
        return;
      }

      const response = await this.model.getAllStories();
      const stories = this.model.getStoriesData();
      
      this.view.displayStories(stories);
      this.view.displayStoriesOnMap(stories);
    } catch (error) {
      console.error('Error in HomePresenter:', error);
      this.view.showError(error.message);
    }
  }

  handleStoryClick(storyId) {
    this.view.navigateTo(`#/detail/${storyId}`);
  }

  async handleSaveStory(storyId) {
    try {
      // Find the story from current stories data
      const stories = this.model.getStoriesData();
      const story = stories.find(s => s.id === storyId);
      
      if (!story) {
        this.view.showError('Cerita tidak ditemukan');
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

export default HomePresenter;