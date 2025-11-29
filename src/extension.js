import Clutter from "gi://Clutter";
import Meta from "gi://Meta";

import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

const OverviewSearchBox = Main.overview._overview._controls._searchEntry;
const OverviewGroup = Main.layoutManager.overviewGroup;

export default class EssentialTweaksExtension extends Extension {
  enable() {
    // Load extension settings
    this._settings = this.getSettings();

    // Focus new windows instead of showing a "window is ready" notification
    this._windowAttentionHandler = global.display.connect("window-demands-attention", (_, window) => {
      if (this._settings.get_boolean("no-window-attention") && !Main.overview._shown) {
        Main.activateWindow(window);
      }
    });

    // Click anywhere to close the overview
    this._overviewClickGesture = new Clutter.ClickGesture();

    this._overviewClickGesture.connect("recognize", (action) => {
      if (!this._settings.get_boolean("click-to-close-overview")) {
        return;
      }

      // Only allow left click
      if (action.get_button() > Clutter.BUTTON_PRIMARY) {
        return;
      }

      // Ignore clicks on the search box
      const [x, y] = global.get_pointer();
      let actor = global.stage.get_actor_at_pos(Clutter.PickMode.ALL, x, y);

      while (actor) {
        if (actor === OverviewSearchBox) {
          return;
        }

        actor = actor.get_parent();
      }

      Main.overview.toggle();
    });

    OverviewGroup.add_action(this._overviewClickGesture);

    // Workspace wraparound
    this._updateWorkspaceWraparound();

    this._settings.connect("changed::workspace-wraparound", () => {
      this._updateWorkspaceWraparound();
    });
  }

  disable() {
    global.display.disconnect(this._windowAttentionHandler);
    OverviewGroup.remove_action(this._overviewClickGesture);
    this._disableWorkspaceWraparound();

    this._windowAttentionHandler = null;
    this._overviewClickGesture = null;
    this._settings = null;
  }

  _updateWorkspaceWraparound() {
    if (this._settings.get_boolean("workspace-wraparound")) {
      this._enableWorkspaceWraparound();
    } else {
      this._disableWorkspaceWraparound();
    }
  }

  _enableWorkspaceWraparound() {
    this._originalWorkspaceProto = Meta.Workspace.prototype.get_neighbor;

    Meta.Workspace.prototype.get_neighbor = function (direction) {
      let index = this.index();
      let lastIndex = global.workspace_manager.n_workspaces - 1;
      let neighborIndex;

      if (direction === Meta.MotionDirection.UP || direction === Meta.MotionDirection.LEFT) {
        neighborIndex = (index > 0) ? index - 1 : lastIndex;
      } else {
        neighborIndex = (index < lastIndex) ? index + 1 : 0;
      }

      return global.workspace_manager.get_workspace_by_index(neighborIndex);
    }
  }

  _disableWorkspaceWraparound() {
    if (this._originalWorkspaceProto) {
      Meta.Workspace.prototype.get_neighbor = this._originalWorkspaceProto;
    }

    this._originalWorkspaceProto = null;
  }
}
