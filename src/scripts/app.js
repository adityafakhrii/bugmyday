import routes from './routes/routes.js';
import UrlParser from './routes/url-parser.js';
import { DrawerInitiator } from './utils/index.js';

class App {
  constructor({ button, drawer, content }) {
    this._button = button;
    this._drawer = drawer;
    this._content = content;

    this._initialAppShell();
  }

  _initialAppShell() {
    DrawerInitiator.init({
      button: this._button,
      drawer: this._drawer,
      content: this._content,
    });
  }

  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    const page = routes[url];
    
    if (!page) {
      // Render halaman Not Found langsung tanpa mengubah hash
      const NotFound = (await import('./pages/not-found/not-found-page.js')).default;
      this._content.innerHTML = await NotFound.render();
      await NotFound.afterRender();
      this._updateActiveNavigation('/not-found');
      return;
    }

    this._content.innerHTML = await page.render();
    await page.afterRender();
    
    this._updateActiveNavigation(url);
    
    if (document.startViewTransition) {
      document.startViewTransition();
    }
  }

  _updateActiveNavigation(currentUrl) {
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });

    const activeNavItem = document.querySelector(`[href="#${currentUrl}"]`);
    if (activeNavItem) {
      activeNavItem.parentElement.classList.add('active');
    }
  }
}

export default App;