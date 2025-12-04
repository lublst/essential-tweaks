import Meta from 'gi://Meta';

export function updateWorkspaceWraparound() {
  if (this._settings.get_boolean('workspace-wraparound')) {
    enableWorkspaceWraparound.bind(this)();
  } else {
    disableWorkspaceWraparound.bind(this)();
  }
}

export function enableWorkspaceWraparound() {
  // Back up the original workspace prototype
  this._originalWorkspaceProto = Meta.Workspace.prototype.get_neighbor;

  // Monkey patching time
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

export function disableWorkspaceWraparound() {
  if (this._originalWorkspaceProto) {
    Meta.Workspace.prototype.get_neighbor = this._originalWorkspaceProto;
  }

  this._originalWorkspaceProto = null;
}
