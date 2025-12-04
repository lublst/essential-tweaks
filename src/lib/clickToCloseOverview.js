import Clutter from 'gi://Clutter';

export function updateClickToCloseOverview() {
  if (this._settings.get_boolean('click-to-close-overview')) {
    enableClickToCloseOverview.bind(this)();
  } else {
    disableClickToCloseOverview.bind(this)();
  }
}

export function enableClickToCloseOverview() {
  this._overviewClickGesture = new Clutter.ClickGesture();

  this._overviewClickGesture.connect('recognize', action => {
    // Only allow left click
    if (action.get_button() > Clutter.BUTTON_PRIMARY) {
      return;
    }

    // Ignore clicks on the search box
    const searchEntry = this._main.overview._overview._controls._searchEntry;
    const [x, y] = global.get_pointer();
    let actor = global.stage.get_actor_at_pos(Clutter.PickMode.ALL, x, y);

    while (actor) {
      if (actor === searchEntry) {
        return;
      }

      actor = actor.get_parent();
    }

    // Close the overview
    this._main.overview.toggle();
  });

  this._main.layoutManager.overviewGroup.add_action(this._overviewClickGesture);
}

export function disableClickToCloseOverview() {
  if (this._overviewClickGesture) {
    this._main.layoutManager.overviewGroup.remove_action(this._overviewClickGesture);
  }

  this._overviewClickGesture = null;
}
