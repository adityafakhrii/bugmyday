import DetailView from '../../views/detail-view.js';
import DetailPresenter from '../../presenters/detail-presenter.js';

const Detail = {
  async render() {
    this.view = new DetailView();
    return this.view.render();
  },

  async afterRender() {
    this.presenter = new DetailPresenter(this.view);
    
    const url = window.location.hash;
    const storyId = this._extractStoryId(url);
    
    await this.presenter.init(storyId);
    
    this.view.addBackButtonHandler(() => {
      this.presenter.handleBackClick();
    });
    
    this.view.addSaveStoryHandler((storyId) => {
      this.presenter.handleSaveStory(storyId);
    });
  },

  _extractStoryId(url) {
    const parts = url.split('/');
    return parts[2] || null;
  },
};

export default Detail;