import StorageModel from './storage-model.js';

class AuthModel {
  constructor() {
    this.currentUser = null;
    this.token = null;
    this.storage = new StorageModel();
  }

  async login(email, password) {
    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      this.token = responseJson.loginResult.token;
      this.currentUser = {
        id: responseJson.loginResult.userId,
        name: responseJson.loginResult.name,
        token: responseJson.loginResult.token
      };

      this.storage.setItem('token', this.token);
      this.storage.setItem('userId', this.currentUser.id);
      this.storage.setItem('userName', this.currentUser.name);

      return responseJson;
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async register(name, email, password) {
    try {
      const response = await fetch('https://story-api.dicoding.dev/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }

  logout() {
    this.currentUser = null;
    this.token = null;
    this.storage.removeItem('token');
    this.storage.removeItem('userId');
    this.storage.removeItem('userName');
  }

  isAuthenticated() {
    const token = this.storage.getItem('token');
    return !!token;
  }

  getCurrentUser() {
    if (!this.currentUser && this.isAuthenticated()) {
      this.currentUser = {
        id: this.storage.getItem('userId'),
        name: this.storage.getItem('userName'),
        token: this.storage.getItem('token')
      };
    }
    return this.currentUser;
  }

  getToken() {
    return this.storage.getItem('token');
  }
}

export default AuthModel;