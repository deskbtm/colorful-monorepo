/* eslint-disable @typescript-eslint/naming-convention */
import { isWithin } from "./utils";
import { window, ConfigurationTarget } from "vscode";
import { getExtensionConfig } from "./utils";
import { DurableWorkspaceItem } from "./interface";

export const colorizeHandler = window.onDidChangeActiveTextEditor(
  async (event) => {
    if (!event) {
      return;
    }

    const workbenchConfig = getExtensionConfig("workbench");
    const config = getExtensionConfig("ColorfulMonorepo.workspaces");
    const collection = config.get<DurableWorkspaceItem[]>("collection");
    const currentPath = window.activeTextEditor?.document.fileName;

    if (!currentPath && !Array.isArray(collection)) {
      return;
    }

    const currentColorCustomization: Record<string, any> =
      workbenchConfig.get("colorCustomizations") || {};

    let w: DurableWorkspaceItem | undefined;

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
  }
);
