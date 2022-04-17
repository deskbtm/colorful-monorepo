import {
  Command,
  EventEmitter,
  FileSystemWatcher,
  TreeItem,
  TreeItemCollapsibleState,
  ThemeIcon,
} from "vscode";

export class FileItem extends TreeItem {
  constructor(
    public override readonly label: string,
    public override readonly collapsibleState: TreeItemCollapsibleState,
    public override readonly tooltip: string,
    public override readonly command?: Command
  ) {
    super(label, collapsibleState);
  }
  override iconPath = ThemeIcon.Folder;
  override contextValue = "workspaceFolder";
}
