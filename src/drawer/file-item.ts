import { Command, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";

export class FileItem extends TreeItem {
  constructor(
    public override readonly resourceUri: Uri,
    public override readonly collapsibleState: TreeItemCollapsibleState,
    public readonly filename: string,
    public override readonly tooltip?: string,
    public override readonly command?: Command
  ) {
    super(resourceUri, collapsibleState);
    this.filename = filename;
  }
  override contextValue = "fileItem";
}
