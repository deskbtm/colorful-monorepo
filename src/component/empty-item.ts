import { ThemeIcon, TreeItem, TreeItemCollapsibleState, Uri } from "vscode";

export class TextItem extends TreeItem {
  override contextValue = "emptyItem";

  constructor(
    public override readonly label: string,
    public override readonly iconPath?:
      | string
      | Uri
      | { light: string | Uri; dark: string | Uri }
      | ThemeIcon,
    public override readonly tooltip?: string
  ) {
    super(label, TreeItemCollapsibleState.None);
  }
}
