import * as AppFavorites from 'resource:///org/gnome/shell/ui/appFavorites.js';

export class NoFavoriteNotification {
  constructor(settings) {
    this._settings = settings;
    this._favorites = AppFavorites.getAppFavorites();

    this._signal = this._settings.connect('changed::no-favorite-notification', () => {
      this.update();
    });
  }

  update() {
    if (this._settings.get_boolean('no-favorite-notification')) {
      this.enable();
    } else {
      this.disable();
    }
  }

  enable() {
    // Back up the original favorites prototype
    this._originalProto = {
      addFavoriteAtPos: this._favorites.addFavoriteAtPos,
      removeFavorite: this._favorites.removeFavorite
    }

    // Override with methods that don't send notifications
    Object.assign(this._favorites, {
      addFavoriteAtPos(appId, pos) {
        this._addFavorite(appId, pos);
      },
      removeFavorite(appId) {
        this._removeFavorite(appId);
      }
    });
  }

  disable() {
    if (this._originalProto) {
      Object.assign(this._favorites, this._originalProto);
    }

    this._originalProto = null;
  }

  destroy() {
    this._settings.disconnect(this._signal);

    this.disable();

    this._settings = null;
    this._favorites = null;
    this._signal = null;
  }
}
