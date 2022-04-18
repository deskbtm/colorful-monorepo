import {
  Command,
  EventEmitter,
  FileSystemWatcher,
  TreeItem,
  TreeItemCollapsibleState,
  ThemeIcon,
  Uri,
} from "vscode";

export class FolderItem extends TreeItem {
  constructor(
    public override readonly label: string,
    public override readonly collapsibleState: TreeItemCollapsibleState,
    public readonly uri: Uri
  ) {
    super(label, collapsibleState);
    this.uri = uri;
  }
  override contextValue = "folderItem";
}
