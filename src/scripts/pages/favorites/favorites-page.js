import FavoritesView from '../../views/favorites-view.js';
import FavoritesPresenter from '../../presenters/favorites-presenter.js';

const Favorites = {
  async render() {
    this.view = new FavoritesView();
    return this.view.render();
  },

  async afterRender() {
    this.presenter = new FavoritesPresenter(this.view);
    
    await this.presenter.init();
    
    this.view.addStoryClickHandlers((storyId) => {
      this.presenter.handleStoryClick(storyId);
    });

    this.view.addRemoveFavoriteHandlers((storyId) => {
      this.presenter.handleRemoveFavorite(storyId);
    });

    this.view.addClearAllHandler(() => {
      this.presenter.handleClearAll();
    });
  },
};

export default Favorites;