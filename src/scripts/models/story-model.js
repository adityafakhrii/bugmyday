import StorageModel from './storage-model.js';
import IndexedDBModel from './indexeddb-model.js';
import NotificationModel from './notification-model.js';

class StoryModel {
  constructor() {
    this.stories = [];
    this.currentStory = null;
    this.storage = new StorageModel();
    this.indexedDB = new IndexedDBModel();
    this.notification = new NotificationModel();
  }

  async getAllStories(page = null, size = null, location = 1) {
    try {
      const token = this.storage.getItem('token');
      
      const params = new URLSearchParams();
      if (page !== null) params.append('page', page);
      if (size !== null) params.append('size', size);
      params.append('location', location);
      
      const queryString = params.toString();
      const url = `https://story-api.dicoding.dev/v1/stories${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 503) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      this.stories = responseJson.listStory;
      
      if (this.stories.length > 0) {
        await this.indexedDB.init();
        for (const story of this.stories) {
          await this.indexedDB.saveStory(story);
        }
      }
      
      return responseJson;
    } catch (error) {
      try {
        await this.indexedDB.init();
        const cachedStories = await this.indexedDB.getAllStories();
        if (cachedStories.length > 0) {
          this.stories = cachedStories;
          return { listStory: cachedStories };
        }
      } catch (dbError) {
        console.error('IndexedDB fallback failed:', dbError);
      }
      throw new Error(`Aplikasi sedang offline. ${error.message}`);
    }
  }

  async getStoryById(id) {
    try {
      const token = this.storage.getItem('token');
      
      try {
        await this.indexedDB.init();
        const cachedStory = await this.indexedDB.getStoryById(id);
        if (cachedStory && !navigator.onLine) {
          this.currentStory = cachedStory;
          return { story: cachedStory };
        }
      } catch (dbError) {
        console.log('IndexedDB lookup failed, trying network');
      }
      
      const response = await fetch(`https://story-api.dicoding.dev/v1/stories/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      this.currentStory = responseJson.story;
      
      try {
        await this.indexedDB.init();
        await this.indexedDB.saveStory(responseJson.story);
      } catch (dbError) {
        console.error('Failed to cache story:', dbError);
      }
      
      return responseJson;
    } catch (error) {
      try {
        await this.indexedDB.init();
        const cachedStory = await this.indexedDB.getStoryById(id);
        if (cachedStory) {
          this.currentStory = cachedStory;
          return { story: cachedStory };
        }
      } catch (dbError) {
        console.error('IndexedDB fallback failed:', dbError);
      }
      throw new Error(`Failed to fetch story detail: ${error.message}`);
    }
  }

  async createStory(description, photo, lat = null, lon = null) {
    try {
      const token = this.storage.getItem('token');
      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photo);
      
      if (lat !== null && lon !== null) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }

      const response = await fetch('https://story-api.dicoding.dev/v1/stories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      
      // Trigger notification dengan story ID dari response (jika ada)
      await this.triggerStoryNotification(description, responseJson.data?.id);

      return responseJson;
    } catch (error) {
      if (!navigator.onLine) {
        try {
          await this.indexedDB.init();
          await this.indexedDB.addToOfflineQueue({
            type: 'CREATE_STORY',
            data: { description, photo, lat, lon },
            timestamp: new Date().toISOString()
          });
          throw new Error('Cerita disimpan untuk dikirim saat online kembali');
        } catch (dbError) {
          console.error('Failed to add to offline queue:', dbError);
        }
      }
      throw new Error(`Failed to create story: ${error.message}`);
    }
  }

  async triggerStoryNotification(description) {
    try {
      const token = this.storage.getItem('token');
      if (!token) return;

      const notificationData = {
        title: 'Story berhasil dibuat',
        options: {
          body: `Anda telah membuat story baru dengan deskripsi: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`
        }
      };

      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          registration.showNotification(notificationData.title, {
            body: notificationData.options.body,
            icon: '/icons/icon.png',
            badge: '/icons/icon.png',
            vibrate: [100, 50, 100],
            data: {
              url: '/#/home',
              timestamp: Date.now()
            },
            actions: [
              {
                action: 'view',
                title: 'Lihat Cerita',
                icon: '/icons/icon.png'
              }
            ]
          });
        } else {
          this.notification.showLocalNotification(notificationData.title, notificationData.options);
        }
      } else {
        this.notification.showLocalNotification(notificationData.title, notificationData.options);
      }
    } catch (error) {
      console.error('Failed to trigger notification:', error);
      this.notification.showLocalNotification('Story berhasil dibuat', {
        body: `Anda telah membuat story baru dengan deskripsi: ${description.substring(0, 50)}...`
      });
    }
  }

  async createGuestStory(description, photo, lat = null, lon = null) {
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photo);
      
      if (lat !== null && lon !== null) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }

      const response = await fetch('https://story-api.dicoding.dev/v1/stories/guest', {
        method: 'POST',
        body: formData,
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }
      
      await this.triggerStoryNotification(description);

      return responseJson;
    } catch (error) {
      throw new Error(`Failed to create guest story: ${error.message}`);
    }
  }

  getStoriesData() {
    return this.stories;
  }

  getCurrentStoryData() {
    return this.currentStory;
  }
}

export default StoryModel;