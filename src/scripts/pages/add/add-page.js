import AddView from '../../views/add-view.js';
import AddPresenter from '../../presenters/add-presenter.js';

const Add = {
  async render() {
    this.view = new AddView();
    return this.view.render();
  },

  async afterRender() {
    this.presenter = new AddPresenter(this.view);
    
    await this.presenter.init();
    
    this.view.addFormSubmitHandler((formData) => {
      return this.presenter.handleFormSubmit(formData);
    });
    
    this.view.addCancelHandler(() => {
      this.presenter.handleCancel();
    });

    window.addEventListener('beforeunload', () => {
      this.view.cleanup();
    });

    const originalHashChange = window.onhashchange;
    window.onhashchange = () => {
      this.view.cleanup();
      if (originalHashChange) {
        originalHashChange();
      }
    };
  },
};

export default Add;