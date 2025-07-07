import AuthView from '../../views/auth-view.js';
import AuthPresenter from '../../presenters/auth-presenter.js';

const Auth = {
  async render() {
    this.view = new AuthView();
    return this.view.render();
  },

  async afterRender() {
    this.presenter = new AuthPresenter(this.view);
    
    await this.presenter.init();
    
    this.view.addLoginHandler((email, password) => {
      return this.presenter.handleLogin(email, password);
    });
    
    this.view.addRegisterHandler((name, email, password) => {
      return this.presenter.handleRegister(name, email, password);
    });
  },
};

export default Auth;