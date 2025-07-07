import App from './app.js';
import StorageModel from './models/storage-model.js';
import { SwRegister } from './utils/index.js';
import NotificationModel from './models/notification-model.js';

const app = new App({
  button: document.querySelector('#menuButton'),
  drawer: document.querySelector('#navDrawer'),
  content: document.querySelector('#main-content'),
});

const storage = new StorageModel();
const notificationModel = new NotificationModel();

const initSkipLink = () => {
  const mainContent = document.querySelector("#main-content");
  const skipLink = document.querySelector(".skip-link");

  skipLink.addEventListener("click", function (event) {
    event.preventDefault();
    skipLink.blur();
    mainContent.focus();
    mainContent.scrollIntoView();
  });
};

const initLogout = () => {
  const logoutBtns = document.querySelectorAll('#logoutBtn, #drawerLogoutBtn');
  
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin keluar?')) {
        storage.removeItem('token');
        storage.removeItem('userId');
        storage.removeItem('userName');
        window.location.hash = '#/auth';
      }
    });
  });
};

const initPushNotification = async () => {
  try {
    const token = storage.getItem('token');
    if (token) {
      const isSubscribed = await notificationModel.isSubscribed();
      if (!isSubscribed) {
        setTimeout(async () => {
          try {
            await notificationModel.subscribeToPushNotification();
            console.log('Push notification subscribed successfully');
            
            setTimeout(async () => {
              try {
                await notificationModel.sendTestNotification();
                console.log('Test notification sent');
              } catch (error) {
                console.log('Test notification failed:', error.message);
              }
            }, 2000);
            
          } catch (error) {
            console.log('Push notification subscription failed:', error.message);
          }
        }, 3000);
      } else {
        console.log('Already subscribed to push notifications');
      }
    }
  } catch (error) {
    console.error('Error initializing push notification:', error);
  }
};

const initServiceWorker = async () => {
  try {
    await SwRegister.init();
    console.log('Service Worker initialized - Application Shell ready');
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
      console.log('App can be installed');
    });
    
    window.addEventListener('appinstalled', () => {
      console.log('App installed successfully');
      window.deferredPrompt = null;
    });
    
  } catch (error) {
    console.error('Service Worker initialization failed:', error);
  }
};

const updateUIBasedOnAuth = () => {
  const token = storage.getItem('token');
  const userName = storage.getItem('userName');
  
  const logoutBtn = document.getElementById('logoutBtn');
  const drawerLogoutBtn = document.getElementById('drawerLogoutBtn');
  const loginNavItem = document.getElementById('loginNavItem');
  const loginDrawerItem = document.getElementById('loginDrawerItem');
  const notificationBtn = document.getElementById('notificationBtn');

  if (token) {
    logoutBtn.style.display = 'flex';
    drawerLogoutBtn.style.display = 'flex';
    loginNavItem.style.display = 'none';
    loginDrawerItem.style.display = 'none';
    
    if (notificationBtn) {
      notificationBtn.style.display = 'flex';
    }
    
    if (userName) {
      logoutBtn.querySelector('span:last-child').textContent = userName;
      drawerLogoutBtn.querySelector('span:last-child').textContent = `Keluar (${userName})`;
    }
  } else {
    logoutBtn.style.display = 'none';
    drawerLogoutBtn.style.display = 'none';
    loginNavItem.style.display = 'block';
    loginDrawerItem.style.display = 'block';
    
    if (notificationBtn) {
      notificationBtn.style.display = 'none';
    }
  }
};

const initNotificationButton = () => {
  const notificationBtn = document.getElementById('notificationBtn');
  
  if (notificationBtn) {
    notificationBtn.addEventListener('click', async () => {
      try {
        const token = storage.getItem('token');
        if (!token) {
          alert('Silakan login terlebih dahulu');
          return;
        }

        const isSubscribed = await notificationModel.isSubscribed();
        
        if (isSubscribed) {
          if (confirm('Apakah Anda ingin berhenti berlangganan notifikasi?')) {
            await notificationModel.unsubscribeFromPushNotification();
            alert('Berhasil berhenti berlangganan notifikasi');
            notificationBtn.innerHTML = '<i class="fas fa-bell-slash"></i><span>Aktifkan Notifikasi</span>';
          }
        } else {
          await notificationModel.subscribeToPushNotification();
          alert('Berhasil berlangganan notifikasi!');
          notificationBtn.innerHTML = '<i class="fas fa-bell"></i><span>Notifikasi Aktif</span>';
          
          setTimeout(async () => {
            try {
              await notificationModel.sendTestNotification();
            } catch (error) {
              console.log('Test notification failed:', error.message);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Notification error:', error);
        alert(`Gagal mengatur notifikasi: ${error.message}`);
      }
    });
  }
};

const performPageTransition = async (callback) => {
  if (!document.startViewTransition) {
    callback();
    return;
  }

  const transition = document.startViewTransition(callback);
  
  try {
    await transition.ready;
    
    const content = document.querySelector('#main-content');
    
    const fadeAnimation = content.animate([
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 400,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      fill: 'forwards'
    });

    await fadeAnimation.finished;
  } catch (error) {
    console.log('Transition interrupted:', error);
  }
};

window.addEventListener('hashchange', () => {
  performPageTransition(() => {
    app.renderPage();
    updateUIBasedOnAuth();
  });
});

window.addEventListener('load', () => {
  performPageTransition(() => {
    app.renderPage();
    updateUIBasedOnAuth();
    initLogout();
    initSkipLink();
    initNotificationButton();
    initServiceWorker();
    initPushNotification();
  });
});

// Listen for messages from service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NAVIGATE_TO') {
      window.location.hash = event.data.url.replace('/#', '#');
    }
  });
}

window.addEventListener('online', () => {
  console.log('App is online');
  if (window.location.hash === '#/home' || window.location.hash === '#/') {
    setTimeout(() => {
      location.reload();
    }, 1000);
  }
  
  const offlineIndicator = document.getElementById('offline-indicator');
  if (offlineIndicator) {
    offlineIndicator.remove();
  }
});

window.addEventListener('offline', () => {
  console.log('App is offline');
  const offlineIndicator = document.createElement('div');
  offlineIndicator.id = 'offline-indicator';
  offlineIndicator.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #f59e0b;
      color: white;
      padding: 8px;
      text-align: center;
      font-size: 14px;
      z-index: 1000;
    ">
      <i class="fas fa-wifi" style="margin-right: 8px;"></i>
      Aplikasi sedang offline - Beberapa fitur mungkin terbatas
    </div>
  `;
  document.body.appendChild(offlineIndicator);
});

initLogout();
initSkipLink();
initNotificationButton();
updateUIBasedOnAuth();