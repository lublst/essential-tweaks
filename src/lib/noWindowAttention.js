export function updateNoWindowAttention() {
  if (this._settings.get_boolean('no-window-attention')) {
    enableNoWindowAttention.bind(this)();
  } else {
    disableNoWindowAttention.bind(this)();
  }
}

export function enableNoWindowAttention() {
  this._windowAttentionHandler = global.display.connect('window-demands-attention', (_, window) => {
    // Ignore when in overview
    if (this._main.overview._shown) {
      return;
    }

    // Focus the window
    this._main.activateWindow(window);
  });
}

export function disableNoWindowAttention() {
  if (this._windowAttentionHandler) {
    global.display.disconnect(this._windowAttentionHandler);
  }

  this._windowAttentionHandler = null;
}
