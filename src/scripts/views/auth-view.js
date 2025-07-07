import BaseView from './base-view.js';

class AuthView extends BaseView {
  constructor() {
    super();
    this.container = this.querySelector('#main-content');
  }

  render() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <header class="auth-header">
            <h1 class="auth-title">DebugMyDay</h1>
            <p class="auth-subtitle">Biar orang lain ikut stress liat bug lo :)</p>
          </header>

          <div class="auth-tabs" role="tablist" aria-label="Pilihan masuk atau daftar">
            <button id="loginTab" class="auth-tab active" role="tab" aria-selected="true" aria-controls="loginForm">Masuk</button>
            <button id="registerTab" class="auth-tab" role="tab" aria-selected="false" aria-controls="registerForm">Daftar</button>
          </div>

          <section id="loginForm" class="auth-form" role="tabpanel" aria-labelledby="loginTab">
            <h2 class="form-title">Selamat Datang!</h2>
            <form id="loginFormElement" aria-label="Form masuk">
              <div class="form-group">
                <label for="loginEmail" class="form-label">
                  <i class="fas fa-envelope" aria-hidden="true"></i>
                  Email
                </label>
                <input 
                  type="email" 
                  id="loginEmail" 
                  name="email" 
                  class="form-input" 
                  placeholder="Tulis email lo..."
                  required
                  aria-describedby="login-email-help"
                />
                <small id="login-email-help" class="sr-only">Masukkan alamat email Anda</small>
              </div>
              
              <div class="form-group">
                <label for="loginPassword" class="form-label">
                  <i class="fas fa-lock" aria-hidden="true"></i>
                  Kata Sandi
                </label>
                <input 
                  type="password" 
                  id="loginPassword" 
                  name="password" 
                  class="form-input" 
                  placeholder="Tulis password lo..."
                  required
                  minlength="8"
                  aria-describedby="login-password-help"
                />
                <small id="login-password-help" class="sr-only">Masukkan kata sandi Anda</small>
              </div>

              <button type="submit" class="auth-button" id="loginButton" aria-label="Masuk ke akun">
                <i class="fas fa-sign-in-alt" aria-hidden="true"></i>
                Masuk
              </button>
            </form>
          </section>

          <section id="registerForm" class="auth-form" style="display: none;" role="tabpanel" aria-labelledby="registerTab">
            <h2 class="form-title">Bikin Akun Baru</h2>
            <form id="registerFormElement" aria-label="Form daftar">
              <div class="form-group">
                <label for="registerName" class="form-label">
                  <i class="fas fa-user" aria-hidden="true"></i>
                  Nama Lengkap
                </label>
                <input 
                  type="text" 
                  id="registerName" 
                  name="name" 
                  class="form-input" 
                  placeholder="Tulis nama lengkap lo"
                  required
                  minlength="2"
                  aria-describedby="register-name-help"
                />
                <small id="register-name-help" class="sr-only">Masukkan nama lengkap Anda</small>
              </div>

              <div class="form-group">
                <label for="registerEmail" class="form-label">
                  <i class="fas fa-envelope" aria-hidden="true"></i>
                  Email
                </label>
                <input 
                  type="email" 
                  id="registerEmail" 
                  name="email" 
                  class="form-input" 
                  placeholder="Tulis email lo"
                  required
                  aria-describedby="register-email-help"
                />
                <small id="register-email-help" class="sr-only">Masukkan alamat email untuk akun baru</small>
              </div>
              
              <div class="form-group">
                <label for="registerPassword" class="form-label">
                  <i class="fas fa-lock" aria-hidden="true"></i>
                  Kata Sandi
                </label>
                <input 
                  type="password" 
                  id="registerPassword" 
                  name="password" 
                  class="form-input" 
                  placeholder="Tulis password lo (min. 8 karakter)"
                  required
                  minlength="8"
                  aria-describedby="register-password-help"
                />
                <small id="register-password-help" class="sr-only">Masukkan kata sandi minimal 8 karakter</small>
              </div>

              <button type="submit" class="auth-button" id="registerButton" aria-label="Buat akun baru">
                <i class="fas fa-user-plus" aria-hidden="true"></i>
                Buat Akun
              </button>
            </form>
          </section>

          <footer class="auth-footer">
            <p class="guest-option">
              Atau <a href="#/add" aria-label="Tambah cerita tanpa login">tambah cerita tanpa login</a>
            </p>
          </footer>
        </div>
      </div>
    `;
  }

  initializeTabs() {
    const loginTab = this.getElementById('loginTab');
    const registerTab = this.getElementById('registerTab');
    const loginForm = this.getElementById('loginForm');
    const registerForm = this.getElementById('registerForm');

    this.addEventListener(loginTab, 'click', () => {
      this._switchTab(loginTab, registerTab, loginForm, registerForm);
    });

    this.addEventListener(registerTab, 'click', () => {
      this._switchTab(registerTab, loginTab, registerForm, loginForm);
    });
  }

  initializeForms() {
  }

  addLoginHandler(onLogin) {
    const form = this.getElementById('loginFormElement');
    if (form && onLogin) {
      this.addEventListener(form, 'submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');
        await onLogin(email, password);
      });
    }
  }

  addRegisterHandler(onRegister) {
    const form = this.getElementById('registerFormElement');
    if (form && onRegister) {
      this.addEventListener(form, 'submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        await onRegister(name, email, password);
      });
    }
  }

  showLoginLoading() {
    const loginButton = this.getElementById('loginButton');
    if (loginButton) {
      loginButton.disabled = true;
      loginButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Masuk...';
    }
  }

  hideLoginLoading() {
    const loginButton = this.getElementById('loginButton');
    if (loginButton) {
      loginButton.disabled = false;
      loginButton.innerHTML = '<i class="fas fa-sign-in-alt" aria-hidden="true"></i> Masuk';
    }
  }

  showRegisterLoading() {
    const registerButton = this.getElementById('registerButton');
    if (registerButton) {
      registerButton.disabled = true;
      registerButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Membuat akun...';
    }
  }

  hideRegisterLoading() {
    const registerButton = this.getElementById('registerButton');
    if (registerButton) {
      registerButton.disabled = false;
      registerButton.innerHTML = '<i class="fas fa-user-plus" aria-hidden="true"></i> Buat Akun';
    }
  }

  showLoginError(message) {
    this.alert(message);
  }

  showRegisterError(message) {
    this.alert(message);
  }

  showRegisterSuccess(message) {
    this.alert(message);
  }

  switchToLoginTab() {
    const loginTab = this.getElementById('loginTab');
    if (loginTab) {
      loginTab.click();
    }
  }

  prefillLoginEmail(email) {
    const loginEmail = this.getElementById('loginEmail');
    if (loginEmail) {
      loginEmail.value = email;
    }
  }

  _switchTab(activeTab, inactiveTab, activeForm, inactiveForm) {
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-selected', 'true');
    inactiveTab.classList.remove('active');
    inactiveTab.setAttribute('aria-selected', 'false');
    activeForm.style.display = 'block';
    inactiveForm.style.display = 'none';
  }
}

export default AuthView;