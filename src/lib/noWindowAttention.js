import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class NoWindowAttention {
  constructor(settings) {
    this._settings = settings;

    this._signal = this._settings.connect('changed::no-window-attention', () => {
      this.update();
    });
  }

  update() {
    if (this._settings.get_boolean('no-window-attention')) {
      this.enable();
    } else {
      this.disable();
    }
  }

  enable() {
    this._windowAttentionHandler = global.display.connect('window-demands-attention', (_, window) => {
      // Ignore when in overview
      if (Main.overview._shown) {
        return;
      }

      // Focus the window
      Main.activateWindow(window);
    });
  }

  disable() {
    if (this._windowAttentionHandler) {
      global.display.disconnect(this._windowAttentionHandler);
    }

    this._windowAttentionHandler = null;
  }

  destroy() {
    this._settings.disconnect(this._signal);

    this.disable();

    this._settings = null;
    this._signal = null;
  }
}
