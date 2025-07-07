class StorageModel {
  constructor() {
    this.storage = window.localStorage;
  }

  setItem(key, value) {
    try {
      this.storage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }

  getItem(key) {
    try {
      return this.storage.getItem(key);
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  }

  removeItem(key) {
    try {
      this.storage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  }

  clear() {
    try {
      this.storage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  hasItem(key) {
    return this.getItem(key) !== null;
  }
}

export default StorageModel;