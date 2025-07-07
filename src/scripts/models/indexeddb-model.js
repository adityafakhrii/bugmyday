import CONFIG from '../config.js';

class IndexedDBModel {
  constructor() {
    this.dbName = CONFIG.DATABASE_NAME;
    this.dbVersion = CONFIG.DATABASE_VERSION;
    this.storeName = CONFIG.OBJECT_STORE_NAME;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create stories object store
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { 
            keyPath: 'id' 
          });
          
          // Create indexes
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('name', 'name', { unique: false });
        }

        // Create favorites object store
        if (!db.objectStoreNames.contains('favorites')) {
          const favStore = db.createObjectStore('favorites', { 
            keyPath: 'id' 
          });
          favStore.createIndex('addedAt', 'addedAt', { unique: false });
        }

        // Create offline queue object store
        if (!db.objectStoreNames.contains('offline-queue')) {
          const queueStore = db.createObjectStore('offline-queue', { 
            keyPath: 'id',
            autoIncrement: true 
          });
          queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveStory(story) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const storyWithTimestamp = {
        ...story,
        savedAt: new Date().toISOString(),
        isOffline: false
      };
      
      const request = store.put(storyWithTimestamp);
      
      request.onsuccess = () => resolve(storyWithTimestamp);
      request.onerror = () => reject(new Error('Failed to save story'));
    });
  }

  async getAllStories() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const stories = request.result.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        resolve(stories);
      };
      request.onerror = () => reject(new Error('Failed to get stories'));
    });
  }

  async getStoryById(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get story'));
    });
  }

  async deleteStory(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error('Failed to delete story'));
    });
  }

  async clearAllStories() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error('Failed to clear stories'));
    });
  }

  async addToFavorites(story) {
    if (!this.db) await this.init();
    
    // Check if story already exists in favorites
    const existingFavorite = await this.getFavoriteById(story.id);
    if (existingFavorite) {
      throw new Error('Story already exists in favorites');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['favorites'], 'readwrite');
      const store = transaction.objectStore('favorites');
      
      const favoriteStory = {
        ...story,
        addedAt: new Date().toISOString()
      };
      
      const request = store.put(favoriteStory);
      
      request.onsuccess = () => resolve(favoriteStory);
      request.onerror = () => reject(new Error('Failed to add to favorites'));
    });
  }

  async getFavoriteById(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['favorites'], 'readonly');
      const store = transaction.objectStore('favorites');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get favorite'));
    });
  }

  async getFavorites() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['favorites'], 'readonly');
      const store = transaction.objectStore('favorites');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const favorites = request.result.sort((a, b) => 
          new Date(b.addedAt) - new Date(a.addedAt)
        );
        resolve(favorites);
      };
      request.onerror = () => reject(new Error('Failed to get favorites'));
    });
  }

  async removeFromFavorites(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['favorites'], 'readwrite');
      const store = transaction.objectStore('favorites');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error('Failed to remove from favorites'));
    });
  }

  async addToOfflineQueue(action) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offline-queue'], 'readwrite');
      const store = transaction.objectStore('offline-queue');
      
      const queueItem = {
        ...action,
        timestamp: new Date().toISOString()
      };
      
      const request = store.add(queueItem);
      
      request.onsuccess = () => resolve(queueItem);
      request.onerror = () => reject(new Error('Failed to add to offline queue'));
    });
  }

  async getOfflineQueue() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offline-queue'], 'readonly');
      const store = transaction.objectStore('offline-queue');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Failed to get offline queue'));
    });
  }

  async clearOfflineQueue() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['offline-queue'], 'readwrite');
      const store = transaction.objectStore('offline-queue');
      const request = store.clear();
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error('Failed to clear offline queue'));
    });
  }
}

export default IndexedDBModel;