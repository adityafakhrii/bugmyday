import AuthModel from '../models/auth-model.js';

class AuthPresenter {
  constructor(view) {
    this.view = view;
    this.model = new AuthModel();
  }

  async init() {
    if (this.model.isAuthenticated()) {
      this.view.navigateTo('#/home');
      return;
    }

    this.view.initializeTabs();
    this.view.initializeForms();
  }

  async handleLogin(email, password) {
    try {
      this.view.showLoginLoading();

      const response = await this.model.login(email, password);
      
      this.view.navigateTo('#/home');
    } catch (error) {
      console.error('Error in AuthPresenter login:', error);
      this.view.showLoginError('Masuk gagal. Silakan periksa email dan kata sandi Anda.');
    } finally {
      this.view.hideLoginLoading();
    }
  }

  async handleRegister(name, email, password) {
    try {
      this.view.showRegisterLoading();

      const response = await this.model.register(name, email, password);
      
      this.view.showRegisterSuccess('Akun berhasil dibuat! Silakan masuk dengan kredensial Anda.');
      this.view.switchToLoginTab();
      this.view.prefillLoginEmail(email);
    } catch (error) {
      console.error('Error in AuthPresenter register:', error);
      
      if (error.message && error.message.includes('Email is already taken')) {
        this.view.showRegisterError('Email ini sudah terdaftar. Silakan gunakan email lain atau coba masuk.');
      } else {
        this.view.showRegisterError(error.message || 'Pendaftaran gagal. Silakan coba lagi.');
      }
    } finally {
      this.view.hideRegisterLoading();
    }
  }
}

export default AuthPresenter;