import {
  Command,
  EventEmitter,
  FileSystemWatcher,
  TreeItem,
  TreeItemCollapsibleState,
  ThemeIcon,
  Uri,
} from "vscode";

export class FileItem extends TreeItem {
  constructor(
    public override readonly resourceUri: Uri,
    public override readonly collapsibleState: TreeItemCollapsibleState,
    public override readonly tooltip?: string
  ) {
    super(resourceUri, collapsibleState);
  }
  override contextValue = "fileItem";
}
