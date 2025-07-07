import StorageModel from './storage-model.js';

class NotificationModel {
  constructor() {
    this.storage = new StorageModel();
    this.vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
    this.baseUrl = 'https://story-api.dicoding.dev/v1';
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('Browser tidak mendukung notifikasi');
    }

    if (!('serviceWorker' in navigator)) {
      throw new Error('Browser tidak mendukung service worker');
    }

    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      throw new Error('Izin notifikasi ditolak');
    }

    return permission;
  }

  async subscribeToPushNotification() {
    try {
      await this.requestPermission();

      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      await this.sendSubscriptionToServer(subscription);
      
      this.storage.setItem('pushSubscription', JSON.stringify(subscription));
      
      return subscription;
    } catch (error) {
      throw new Error(`Gagal berlangganan notifikasi: ${error.message}`);
    }
  }

  async unsubscribeFromPushNotification() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await this.sendUnsubscriptionToServer(subscription);
        await subscription.unsubscribe();
        this.storage.removeItem('pushSubscription');
      }
      
      return true;
    } catch (error) {
      throw new Error(`Gagal berhenti berlangganan: ${error.message}`);
    }
  }

  async sendSubscriptionToServer(subscription) {
    const token = this.storage.getItem('token');
    
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }

    const subscriptionData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
      }
    };

    const response = await fetch(`${this.baseUrl}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriptionData)
    });

    const responseJson = await response.json();
    
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson;
  }

  async sendUnsubscriptionToServer(subscription) {
    const token = this.storage.getItem('token');
    
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }

    const response = await fetch(`${this.baseUrl}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint
      })
    });

    const responseJson = await response.json();
    
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson;
  }

  async isSubscribed() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      return false;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  showLocalNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/icons/icon.png',
        badge: '/icons/icon.png',
        ...options
      });
    }
  }

  async sendTestNotification() {
    const token = this.storage.getItem('token');
    
    if (!token) {
      throw new Error('Token tidak ditemukan');
    }

    try {
      const response = await fetch(`${this.baseUrl}/notifications/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Notification',
          options: {
            body: 'Ini adalah test notifikasi dari DebugMyDay'
          }
        })
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      console.log('Test notification endpoint not available, using local notification');
      this.showLocalNotification('Test Notification', {
        body: 'Ini adalah test notifikasi dari DebugMyDay'
      });
    }
  }
}

export default NotificationModel;