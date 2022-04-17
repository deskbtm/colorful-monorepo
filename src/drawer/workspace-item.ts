import {
  Command,
  EventEmitter,
  FileSystemWatcher,
  TreeItem,
  TreeItemCollapsibleState,
  ThemeIcon,
  Uri,
} from "vscode";

export class WorkspaceItem extends TreeItem {
  // override iconPath = ThemeIcon.Folder;
  override contextValue = "workspaceFolder";
  public uri?: Uri;

  constructor(
    public override readonly label: string,
    public override readonly collapsibleState: TreeItemCollapsibleState,
    public override readonly tooltip: string,
    uri?: Uri // public override readonly command?: Command,
  ) {
    super(label, collapsibleState);
    this.uri = uri;
  }
}
