import HomeView from '../../views/home-view.js';
import HomePresenter from '../../presenters/home-presenter.js';

const Home = {
  async render() {
    this.view = new HomeView();
    return this.view.render();
  },

  async afterRender() {
    this.presenter = new HomePresenter(this.view);
    
    this.view.initializeMap();
    
    await this.presenter.init();
    
    this.view.addStoryClickHandlers((storyId) => {
      this.presenter.handleStoryClick(storyId);
    });
    
    this.view.addSaveStoryHandlers((storyId) => {
      this.presenter.handleSaveStory(storyId);
    });
  },
};

export default Home;