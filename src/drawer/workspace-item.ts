import { TreeItem, TreeItemCollapsibleState } from "vscode";

export class WorkspaceItem extends TreeItem {
  override contextValue = "workspaceFolder";

  constructor(
    public override readonly label: string,
    public override readonly collapsibleState: TreeItemCollapsibleState,
    // public readonly uri: Uri,
    public override readonly tooltip?: string
  ) {
    super(label, collapsibleState);
  }
}

// public override readonly command?: Command,
