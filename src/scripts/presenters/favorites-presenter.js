import IndexedDBModel from '../models/indexeddb-model.js';

class FavoritesPresenter {
  constructor(view) {
    this.view = view;
    this.model = new IndexedDBModel();
  }

  async init() {
    try {
      this.view.showLoading();
      
      await this.model.init();
      const favorites = await this.model.getFavorites();
      
      this.view.displayFavorites(favorites);
    } catch (error) {
      console.error('Error in FavoritesPresenter:', error);
      this.view.showError(error.message);
    }
  }

  async handleStoryClick(storyId) {
    this.view.navigateTo(`#/detail/${storyId}`);
  }

  async handleRemoveFavorite(storyId) {
    try {
      await this.model.removeFromFavorites(storyId);
      this.view.showSuccess('Cerita berhasil dihapus dari favorit');
      
      // Refresh the favorites list
      await this.init();
    } catch (error) {
      console.error('Error removing favorite:', error);
      this.view.showError('Gagal menghapus cerita dari favorit');
    }
  }

  async handleClearAll() {
    try {
      const favorites = await this.model.getFavorites();
      
      // Remove all favorites one by one
      for (const favorite of favorites) {
        await this.model.removeFromFavorites(favorite.id);
      }
      
      this.view.showSuccess('Semua cerita favorit berhasil dihapus');
      
      // Refresh the favorites list
      await this.init();
    } catch (error) {
      console.error('Error clearing all favorites:', error);
      this.view.showError('Gagal menghapus semua cerita favorit');
    }
  }
}

export default FavoritesPresenter;