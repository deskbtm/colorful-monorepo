import { workspace } from "vscode";
/* eslint-disable @typescript-eslint/naming-convention */
import { isWithin, matchWorkspace } from "./utils";
import { window, ConfigurationTarget } from "vscode";
import { getExtensionConfig } from "./utils";
import { CollectionItem } from "./interface";
import debounce from "lodash.debounce";

export const colorizeHandler = window.onDidChangeActiveTextEditor(
  debounce(async (event) => {
    const colorizeConfig = getExtensionConfig("ColorfulMonorepo.colorize");
    // Dynamic config
    if (!colorizeConfig.get<boolean>("enabled")) {
      colorizeHandler.dispose();
      return;
    }

    if (!event || !matchWorkspace()) {
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
      workbenchConfig.get("colorCustomizations") ?? {};

    let w: CollectionItem | undefined;

    for (const item of collection!) {
      if (isWithin(item.path, currentPath!)) {
        w = item;
      }
    }

    if (!w) {
      return;
    }

    await workbenchConfig.update(
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
