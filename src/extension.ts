/**
 * Copyright (C) 2022 WangHan
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { disposeAll } from "./utils";
import {
  commands,
  ConfigurationTarget,
  Disposable,
  ExtensionContext,
  window,
} from "vscode";
import { DrawerProvider } from "./drawer/drawer-provider";
import { colorizeHandler } from "./colorize";
import { getExtensionConfig, getExtensionCwd } from "./utils";
import {
  removeWorkspace,
  selectWorkspacePackages,
  folderAsWorkspace,
  syncFolders2Durable,
} from "./javascript/workspace";
import { createAutoArrange } from "./arrange";

const disposables: Disposable[] = [];

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
  const cwd = getExtensionCwd();

  if (!cwd) {
    return;
  }

  // 同步folders和ColorfulMonorepo.workspaces.collection
  await syncFolders2Durable();

  commands.executeCommand("setContext", "explorerExclude:enabled", true);

  const colorizeConfig = getExtensionConfig("ColorfulMonorepo.colorize");
  const arrangeConfig = getExtensionConfig("ColorfulMonorepo.arrange");

  if (arrangeConfig.get<boolean>("enabled")) {
    // if arrange enabled OpenEditors will disable
    commands.executeCommand("workbench.explorer.openEditorsView.removeView");
  }

  if (!colorizeConfig.get<boolean>("enabled")) {
    await getExtensionConfig("workbench").update(
      "colorCustomizations",
      {},
      ConfigurationTarget.Workspace
    );
  }

  const drawerProvider = new DrawerProvider(cwd);

  const drawerView = window.createTreeView("drawer", {
    treeDataProvider: drawerProvider,
  });

  const selectPackages = commands.registerCommand(
    "com.deskbtm.ColorfulMonorepo.workspace.select",
    selectWorkspacePackages
  );

  const asWorkspace = commands.registerCommand(
    "com.deskbtm.ColorfulMonorepo.workspace.asWorkspace",
    async (_, items) => folderAsWorkspace(_, items)
  );

  const rmWorkspace = commands.registerCommand(
    "com.deskbtm.ColorfulMonorepo.workspace.removeWorkspace",
    async (_, items) => removeWorkspace(_, items)
  );

  const autoArrange = createAutoArrange(context);

  disposables.push(
    drawerView,
    selectPackages,
    autoArrange,
    asWorkspace,
    rmWorkspace
  );

  colorizeConfig.get<boolean>("enabled")
    ? disposables.push(colorizeHandler)
    : colorizeHandler.dispose();

  context.subscriptions.push(...disposables);
}

// this method is called when your extension is deactivated
export function deactivate() {
  disposeAll(disposables);
}
