import Home from '../pages/home/home-page.js';
import About from '../pages/about/about-page.js';
import Add from '../pages/add/add-page.js';
import Auth from '../pages/auth/auth-page.js';
import Detail from '../pages/detail/detail-page.js';
import Favorites from '../pages/favorites/favorites-page.js';
import NotFound from '../pages/not-found/not-found-page.js';

const routes = {
  '/': Home,
  '/home': Home,
  '/about': About,
  '/add': Add,
  '/auth': Auth,
  '/detail/:id': Detail,
  '/favorites': Favorites,
  '/not-found': NotFound,
};

export default routes;