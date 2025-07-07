class BaseView {
  constructor() {
    this.window = window;
    this.document = document;
  }

  navigateTo(hash) {
    this.window.location.hash = hash;
  }

  reload() {
    this.window.location.reload();
  }

  confirm(message) {
    return this.window.confirm(message);
  }

  alert(message) {
    this.window.alert(message);
  }

  scrollToTop() {
    this.window.scrollTo(0, 0);
  }

  focus(element) {
    if (element && element.focus) {
      element.focus();
    }
  }

  scrollIntoView(element) {
    if (element && element.scrollIntoView) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  querySelector(selector) {
    return this.document.querySelector(selector);
  }

  querySelectorAll(selector) {
    return this.document.querySelectorAll(selector);
  }

  getElementById(id) {
    return this.document.getElementById(id);
  }

  addEventListener(element, event, handler) {
    if (element && element.addEventListener) {
      element.addEventListener(event, handler);
    }
  }

  removeEventListener(element, event, handler) {
    if (element && element.removeEventListener) {
      element.removeEventListener(event, handler);
    }
  }

  startViewTransition(callback) {
    if (this.document.startViewTransition) {
      return this.document.startViewTransition(callback);
    } else {
      callback();
      return null;
    }
  }
}

export default BaseView;