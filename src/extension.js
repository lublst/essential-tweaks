import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

import { ClickToCloseOverview } from './lib/clickToCloseOverview.js';
import { NoFavoriteNotification } from './lib/noFavoriteNotification.js';
import { NoOverviewOnStartup } from './lib/noOverviewOnStartup.js';
import { NoWindowAttention } from './lib/noWindowAttention.js';
import { PanelCorners } from './lib/panelCorners.js';
import { ScreenCorners } from './lib/screenCorners.js';
import { WorkspaceWraparound } from './lib/workspaceWraparound.js';

export default class EssentialTweaksExtension extends Extension {
  enable() {
    this._settings = this.getSettings();

    this._modules = [
      new ClickToCloseOverview(this._settings),
      new NoFavoriteNotification(this._settings),
      new NoOverviewOnStartup(this._settings),
      new NoWindowAttention(this._settings),
      new PanelCorners(this._settings),
      new ScreenCorners(this._settings),
      new WorkspaceWraparound(this._settings)
    ];

    this._modules.forEach(module => module.update());
  }

  disable() {
    this._modules.forEach(module => module.destroy());

    this._settings = null;
    this._modules = null;
  }
}
