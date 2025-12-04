export function updateNoOverviewOnStartup() {
  if (this._settings.get_boolean('show-overview-on-startup')) {
    disableNoOverviewOnStartup.bind(this)();
  } else {
    enableNoOverviewOnStartup.bind(this)();
  }
}

export function enableNoOverviewOnStartup() {
  if (!this._main.layoutManager._startingUp) {
    return;
  }

  // Disable the overview entirely
  if (this._originalHasOverview != null) {
    this._originalHasOverview = this._main.sessionMode.hasOverview;
  }

  this._main.sessionMode.hasOverview = false;

  // Restore the original state after startup is complete
  this._sharedSignals.noOverviewOnStartup = ['startup-complete', disableNoOverviewOnStartup.bind(this)];
}

export function disableNoOverviewOnStartup() {
  if (this._originalHasOverview != null) {
    this._main.sessionMode.hasOverview = this._originalHasOverview;
  }

  this._originalHasOverview = null;

  delete this._sharedSignals.noOverviewOnStartup;
}
