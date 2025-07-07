import CONFIG from '../config.js';

const WebSocketInitiator = {
  init(callback) {
    const webSocket = new WebSocket(CONFIG.WEB_SOCKET_SERVER);
    
    webSocket.onmessage = this._onMessageHandler.bind(this, callback);
    webSocket.onopen = this._onOpenHandler;
    webSocket.onerror = this._onErrorHandler;
    webSocket.onclose = this._onCloseHandler;
  },

  _onOpenHandler(event) {
    console.log('WebSocket connection opened:', event);
  },

  _onMessageHandler(callback, event) {
    const data = JSON.parse(event.data);
    callback(data);
  },

  _onErrorHandler(event) {
    console.error('WebSocket error:', event);
  },

  _onCloseHandler(event) {
    console.log('WebSocket connection closed:', event);
  },
};

export default WebSocketInitiator;