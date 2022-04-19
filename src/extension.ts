import { DrawerProvider } from "./drawer/drawer-provider";
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
import { commands, ExtensionContext, window, workspace } from "vscode";
import { colorizeHandler } from "./colorize";
import {
  getExtensionConfig,
  getExtensionCwd,
  switchExperimentalFileNesting,
} from "./utils";
import { selectWorkspacePackages } from "./workspace";
import { moveOut } from "./drawer/actions";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // 此处强制开启实验性的 file nesting
  switchExperimentalFileNesting(true);

  commands.executeCommand("setContext", "explorerExclude:enabled", true);

  const colorizeConfig = getExtensionConfig("ColorfulMonorepo.colorize");
  const cwd = getExtensionCwd();

  if (cwd) {
    const drawerProvider = new DrawerProvider(cwd);
    // window.registerTreeDataProvider("drawer", drawerProvider);

    window.createTreeView("drawer", {
      treeDataProvider: new DrawerProvider(cwd),
    });

    const drawerRefresh = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.refresh",
      () => {
        drawerProvider.refresh();
      }
    );

    const move2Drawer = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.move2",
      selectWorkspacePackages
    );

    const move2GlobDrawer = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.move2Glob",
      selectWorkspacePackages
    );

    const moveOutFromDrawer = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.moveOut",
      (item) => {
        moveOut(item, drawerProvider);
      }
    );

    context.subscriptions.push(
      move2Drawer,
      moveOutFromDrawer,
      drawerRefresh,
      move2GlobDrawer
    );
  }

  if (colorizeConfig.get<boolean>("enabled")) {
    context.subscriptions.push(colorizeHandler);
  }

  const selectPackages = commands.registerCommand(
    "com.deskbtm.ColorfulMonorepo.select",
    selectWorkspacePackages
  );

  context.subscriptions.push(selectPackages);

  // colorizeHandler;
}

// this method is called when your extension is deactivated
export function deactivate() {}
