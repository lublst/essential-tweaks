import Cairo from 'cairo';
import Clutter from 'gi://Clutter';
import Cogl from 'gi://Cogl';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { ANIMATION_TIME } from 'resource:///org/gnome/shell/ui/overview.js';

export function updatePanelCorners() {
  if (this._settings.get_boolean('panel-corners')) {
    enablePanelCorners.bind(this)();
  } else {
    disablePanelCorners.bind(this)();
  }
}

export function enablePanelCorners() {
  const init = () => {
    this._panelCorners = new PanelCorners();

    update();
  }

  const update = () => {
    if (this._panelCorners) {
      this._panelCorners.update();
    }
  }

  if (this._main.layoutManager._startingUp) {
    this._sharedSignals.panelCornersStartup = ['startup-complete', init];
  } else {
    init();
  }

  this._sharedSignals.panelCornersMonitorsChanged = ['monitors-changed', update];
  this._sharedSignals.panelCornersWorkareasChanged = ['workareas-changed', update];
}

export function disablePanelCorners() {
  if (this._panelCorners) {
    this._panelCorners.remove();
  }

  this._panelCorners = null;

  delete this._sharedSignals.panelCornersStartup;
  delete this._sharedSignals.panelCornersMonitorsChanged;
  delete this._sharedSignals.panelCornersWorkareasChanged;
}

class PanelCorners {
  update() {
    // Remove old corners
    this.remove();

    // Create new panel corners
    Main.panel._leftCorner = new PanelCorner(St.Side.LEFT);
    Main.panel._rightCorner = new PanelCorner(St.Side.RIGHT);

    this.update_corner(Main.panel._leftCorner);
    this.update_corner(Main.panel._rightCorner);
  }

  update_corner(corner) {
    Main.panel.bind_property('style', corner, 'style', GObject.BindingFlags.SYNC_CREATE);
    Main.panel.add_child(corner);

    corner.vfunc_style_changed();
  }

  remove() {
    if (Main.panel._leftCorner) {
      this.remove_corner(Main.panel._leftCorner);
    }

    if (Main.panel._rightCorner) {
      this.remove_corner(Main.panel._rightCorner);
    }

    Main.panel._leftCorner = null;
    Main.panel._rightCorner = null;
  }

  remove_corner(corner) {
    Main.panel.remove_child(corner);

    corner.disconnectSignals();
    corner.destroy();
  }
}

class PanelCorner extends St.DrawingArea {
  static {
    GObject.registerClass(this);
  }

  constructor(side) {
    super({ style_class: 'panel-corner' });

    const scaleFactor = St.ThemeContext.get_for_stage(global.stage).scale_factor;

    this._side = side;
    this._radius = 12 * scaleFactor;

    this._positionChangeHandler = Main.panel.connect('notify::position', this._update_corner_position.bind(this));
    this._sizeChangeHandler = Main.panel.connect('notify::size', this._update_corner_position.bind(this));

    this.set_opacity(0);
  }

  _update_corner_position() {
    const childBox = new Clutter.ActorBox();

    switch (this._side) {
      case St.Side.LEFT:
        childBox.x1 = 0;
        childBox.x2 = this._radius;
        childBox.y1 = Main.panel.height;
        childBox.y2 = Main.panel.height + this._radius;

        break;

      case St.Side.RIGHT:
        childBox.x1 = Main.panel.width - this._radius;
        childBox.x2 = Main.panel.width;
        childBox.y1 = Main.panel.height;
        childBox.y2 = Main.panel.height + this._radius;

        break;
    }

    this.allocate(childBox);
  }

  vfunc_repaint() {
    const cr = this.get_context();
    const color = Cogl.color_from_string('#000000ff')[1];
    const radius = this._radius;

    cr.setOperator(Cairo.Operator.SOURCE);
    cr.setSourceColor(color);

    cr.moveTo(0, 0);

    switch (this._side) {
      case St.Side.LEFT:
        cr.arc(radius, radius, radius, Math.PI, 3 * Math.PI / 2);
        cr.lineTo(radius, 0);

        break;

      case St.Side.RIGHT:
        cr.arc(0, radius, radius, 3 * Math.PI / 2, 2 * Math.PI);
        cr.lineTo(radius, 0);

        break;
    }

    cr.closePath();
    cr.fill();

    cr.$dispose();
  }

  vfunc_style_changed() {
    super.vfunc_style_changed();

    this.set_size(this._radius, this._radius);
    this._update_corner_position();

    const panelClass = Main.panel.get_style_pseudo_class();
    const inOverview = panelClass && panelClass.includes('overview');

    this.remove_transition('opacity');
    this.ease({
      opacity: inOverview ? 0 : 255,
      duration: ANIMATION_TIME,
      mode: Clutter.AnimationMode.EASE_IN_OUT_QUAD,
    });
  }

  disconnectSignals() {
    if (this._positionChangeHandler) {
      Main.panel.disconnect(this._positionChangeHandler);
    }

    if (this._sizeChangeHandler) {
      Main.panel.disconnect(this._sizeChangeHandler);
    }

    this._positionChangeHandler = null;
    this._sizeChangeHandler = null;
  }
}
