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
import { getExtensionCwd, switchExperimentalFileNesting } from "./utils";
import { selectWorkspacePackages } from "./workspace";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
  // 此处强制开启实验性的 file nesting
  switchExperimentalFileNesting(true);

  const cwd = getExtensionCwd();

  if (cwd) {
    window.registerTreeDataProvider("drawer", new DrawerProvider(cwd));
  }

  let selectPackages = commands.registerCommand(
    "com.deskbtm.ColorfulMonorepo.select",
    selectWorkspacePackages
  );

  context.subscriptions.push(selectPackages, colorizeHandler);
}

// this method is called when your extension is deactivated
export function deactivate() {}
