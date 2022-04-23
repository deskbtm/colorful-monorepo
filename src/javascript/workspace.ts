import {
  QuickPickItem,
  Uri,
  window,
  workspace,
  ConfigurationTarget,
} from "vscode";
import { getWorkspaces, WorkspaceInfo } from "@deskbtm/workspace-tools";
import {
  autoGenerateColor,
  getExtensionConfig,
  getExtensionCwd,
  matchEmoji,
} from "../utils";
import { DurableWorkspaceItem } from "../interface";
import * as path from "path";

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
  let {
    cwd = getExtensionCwd(),
    includeRoot = getExtensionConfig().get<boolean>("includeRoot") ?? true,
  } = options;

  let allPackages: PackageItem[] = [];
  const packagesMap = new Map<string, PackageItem>();

  if (cwd) {
    let packages = getWorkspaces(cwd, { includeRoot });

    for (const pkg of packages) {
      const isRootWorkspace = cwd === pkg.path;
      const relative = path.relative(cwd, pkg.path);
      const desc = pkg.packageJson["description"];
      const label = `${matchEmoji(relative, isRootWorkspace)} ${pkg.name}`;

      const item = {
        label,
        description: `${relative} ${desc ? " | " + desc : ""}`,
        uri: Uri.file(pkg.path),
        relative,
        packageName: pkg.name,
        isRootWorkspace,
        ...pkg,
        name: label,
      };

      allPackages.push(item);

      packagesMap.set(pkg.path, item);
    }
  }

  return { packagesMap, allPackages };
};

export const updateWorkspace = async function (packages?: PackageItem[]) {
  if (!packages) {
    packages = getAllPackages().allPackages;
  }

  const config = getExtensionConfig("ColorfulMonorepo.workspaces");

  const folders = workspace.workspaceFolders;
  const durableWorkspaceConfigs: DurableWorkspaceItem[] = [];
  for (const p of packages) {
    const { foreground, background } = autoGenerateColor();

    durableWorkspaceConfigs.push({
      path: p.path,
      packageName: p.packageName,
      label: p.label,
      foreground,
      background,
    });
  }

  await config.update(
    "collection",
    durableWorkspaceConfigs,
    ConfigurationTarget.Workspace
  );

  workspace.updateWorkspaceFolders(0, folders?.length, ...packages);
};

export const selectWorkspacePackages = async function (items?: any[]) {
  const { allPackages } = getAllPackages();

  const folders = workspace.workspaceFolders;

  if (folders) {
    start: for (const f of folders) {
      for (const p of allPackages) {
        if (p.path === f.uri.fsPath) {
          p.picked = true;
          continue start;
        }
      }
    }
  }

  const picked = await window.showQuickPick<PackageItem>(allPackages, {
    canPickMany: true,
    matchOnDescription: true,
  });

  picked?.length && updateWorkspace(picked);
};
