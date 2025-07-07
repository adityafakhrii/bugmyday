const SwRegister = {
  async init() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported in this browser');
      return;
    }

    if (window.location.hostname === 'localhost' && window.location.port) {
      try {
        const testRegistration = await navigator.serviceWorker.getRegistration();
      } catch (error) {
        console.log('Service Worker not supported in this development environment');
        return;
      }
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
      });
      
      console.log('Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }
};

export default SwRegister;