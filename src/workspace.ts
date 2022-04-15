import { QuickPickItem, Uri, window, workspace } from "vscode";
import { getWorkspaces, WorkspaceInfo } from "@deskbtm/workspace-tools";
import { getExtensionCwd, matchEmoji } from "./utils";
import * as path from "path";
import G = require("glob");

type WorkspaceItem = WorkspaceInfo extends (infer T)[] ? T : [];

interface PackageItem extends QuickPickItem, WorkspaceItem {
  isRootWorkspace: boolean;
  relative: string;
  uri: Uri;
  packageName: string;
}

interface GetAllPackagesOptions {
  cwd?: string;
  includeRoot?: boolean;
}

export const getAllPackages = function (options: GetAllPackagesOptions = {}) {
  const { cwd = getExtensionCwd(), includeRoot = true } = options;

  let allPackages: PackageItem[] = [];

  if (cwd) {
    const packages = getWorkspaces(cwd, { includeRoot });

    for (const pkg of packages) {
      const isRootWorkspace = cwd === pkg.path;
      const relative = path.relative(cwd, pkg.path);
      const desc = pkg.packageJson["description"];
      const label = `${matchEmoji(relative, isRootWorkspace)} ${pkg.name}`;

      allPackages.push({
        label,
        description: `${relative} ${desc ? " | " + desc : ""}`,
        uri: Uri.file(pkg.path),
        relative,
        packageName: pkg.name,
        isRootWorkspace,
        ...pkg,
        name: label,
      });
    }
  }

  return allPackages;
};

export const updateWorkspace = function (packages?: PackageItem[]) {
  if (!packages) {
    packages = getAllPackages();
  }

  const folders = workspace.workspaceFolders;

  console.log(packages);

  workspace.updateWorkspaceFolders(0, folders?.length, ...packages);
};

export const selectWorkspacePackages = async function (items?: any[]) {
  const packages = getAllPackages();

  if (!Array.isArray(packages)) {
    return;
  }

  const picked = await window.showQuickPick<PackageItem>(packages, {
    canPickMany: true,
    matchOnDescription: true,
  });

  updateWorkspace(picked);
};

// async function updateAll(items?: WorkspaceFolderItem[], clean = false) {
//   const config = vscodeWorkspace.getConfiguration("monorepoWorkspace");
//   if (!items) items = await getPackageFolders(config.get("includeRoot"));
//   if (!items) return;
//   const itemsSet = new Set(items.map((item) => item.root.fsPath));
//   const folders = vscodeWorkspace.workspaceFolders;
//   const adds: { name: string; uri: Uri }[] = [];
//   if (folders && !clean) {
//     adds.push(...folders.filter((f) => !itemsSet.has(f.uri.fsPath)));
//   }
//   adds.push(
//     ...items.map((item) => ({
//       name: item.label,
//       uri: item.root,
//     }))
//   );
//   vscodeWorkspace.updateWorkspaceFolders(0, folders?.length, ...adds);
// }
