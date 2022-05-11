import { workspace } from "vscode";
/* eslint-disable @typescript-eslint/naming-convention */
import { isWithin } from "./utils";
import { window, ConfigurationTarget } from "vscode";
import { getExtensionConfig } from "./utils";
import { CollectionItem } from "./interface";
import debounce from "lodash.debounce";

export const colorizeHandler = window.onDidChangeActiveTextEditor(
  debounce(async (event) => {
    if (!event || (workspace.workspaceFolders?.length ?? 0) < 2) {
      return;
    }

    const workbenchConfig = getExtensionConfig("workbench");
    const config = getExtensionConfig("ColorfulMonorepo.workspaces");
    const collection = config.get<CollectionItem[]>("collection");
    const currentPath = window.activeTextEditor?.document.fileName;

    if (!currentPath && !Array.isArray(collection)) {
      return;
    }

    const currentColorCustomization: Record<string, any> =
      workbenchConfig.get("colorCustomizations") || {};

    let w: CollectionItem | undefined;

    for (const item of collection!) {
      if (isWithin(item.path, currentPath!)) {
        w = item;
      }
    }

    if (!w) {
      return;
    }

    workbenchConfig.update(
      "colorCustomizations",
      {
        ...currentColorCustomization,
        ...{
          "statusBar.background": w.background,
          "statusBar.foreground": w.foreground,
          "tab.activeBorder": w.background,
          "sideBarTitle.foreground": w.background,
        },
      },
      ConfigurationTarget.Workspace
    );
  }, 100)
);
