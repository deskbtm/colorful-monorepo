import { TreeItem, TreeItemCollapsibleState } from "vscode";

export class WorkspaceItem extends TreeItem {
  override contextValue = "workspaceFolder";

  constructor(
    public override readonly label: string,
    public override readonly collapsibleState: TreeItemCollapsibleState,
    public override readonly description?: string,
    public override readonly tooltip?: string
  ) {
    super(label, collapsibleState);
  }
}
