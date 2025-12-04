import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class NoOverviewOnStartup {
  constructor(settings) {
    this._settings = settings;

    this._signal = this._settings.connect('changed::show-overview-on-startup', () => {
      this.update();
    });
  }

  update() {
    if (this._settings.get_boolean('show-overview-on-startup')) {
      this.disable();
    } else {
      this.enable();
    }
  }

  enable() {
    if (!Main.layoutManager._startingUp) {
      return;
    }

    if (this._originalHasOverview != null) {
      this._originalHasOverview = Main.sessionMode.hasOverview;
    }

    Main.sessionMode.hasOverview = false;

    this._startupSignal = Main.layoutManager.connect('startup-complete', () => {
      this.disable();
    });
  }

  disable() {
    if (this._originalHasOverview != null) {
      Main.sessionMode.hasOverview = this._originalHasOverview;
    }

    if (this._startupSignal) {
      Main.layoutManager.disconnect(this._startupSignal);
    }

    this._originalHasOverview = null;
    this._startupSignal = null;
  }

  destroy() {
    this._settings.disconnect(this._signal);

    this.disable();

    this._settings = null;
    this._signal = null;
  }
}
