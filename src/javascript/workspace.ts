import {
  QuickPickItem,
  Uri,
  window,
  workspace,
  ConfigurationTarget,
  FileType,
} from "vscode";
import {
  getWorkspaces,
  PackageInfo,
  WorkspaceInfo,
} from "@deskbtm/workspace-tools";
import {
  randomColorPair,
  getExtensionConfig,
  getExtensionCwd,
  matchEmoji,
} from "../utils";
import { CollectionItem } from "../interface";
import * as path from "path";

type WorkspaceItem = WorkspaceInfo extends (infer T)[] ? T : [];

type Folder = { uri: Uri; folderAsWorkspace?: boolean };

interface ModuleItem extends QuickPickItem, Omit<WorkspaceItem, "packageJson"> {
  isRootWorkspace: boolean;
  relative: string;
  uri: Uri;
  packageName?: string;
  folderAsWorkspace?: boolean;
  packageJson?: PackageInfo;
}

interface GetAllPackagesOptions {
  cwd?: string;
  includeRoot?: boolean;
}

export const isSingleWorkspaceProject = function () {
  return !workspace.workspaceFile;
};

const folder2ModuleItem = function (
  f: Folder,
  pkgMap?: Map<string, ModuleItem>
): ModuleItem {
  if (!pkgMap) {
    pkgMap = getAllPackages().packagesMap;
  }
  const cwd = getExtensionCwd();
  let pkg = pkgMap.get(f.uri.fsPath);

  if (!pkg) {
    const p = f.uri.fsPath;
    pkg = {
      label: path.basename(f.uri.fsPath),
      uri: f.uri,
      isRootWorkspace: cwd === p,
      relative: path.relative(cwd!, p),
      packageName: path.basename(p),
      name: path.basename(p),
      path: p,
    };
  }
  return pkg!;
};

const collection2Modules = function (
  collection: CollectionItem[],
  pkgMap?: Map<string, ModuleItem>
): ModuleItem[] {
  if (!pkgMap) {
    pkgMap = getAllPackages().packagesMap;
  }

  const modules: ModuleItem[] = [];

  for (const c of collection) {
    const p = folder2ModuleItem({ uri: Uri.file(c.path) }, pkgMap);
    modules.push(p);
  }

  return modules;
};

export const getAllPackages = function (options: GetAllPackagesOptions = {}) {
  let {
    cwd = getExtensionCwd(),
    includeRoot = getExtensionConfig().get<boolean>("includeRoot") ?? true,
  } = options;

  let allPackages: ModuleItem[] = [];
  const packagesMap = new Map<string, ModuleItem>();

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

const push2DurableCollection = function (
  p: ModuleItem,
  collection: CollectionItem[]
) {
  let { foreground, background } = randomColorPair();

  collection.push({
    path: p.path,
    packageName: p.packageName,
    label: p.label,
    folderAsWorkspace: p.folderAsWorkspace,
    foreground,
    background,
  });
};

export const syncFolders2Durable = async function () {
  const config = getExtensionConfig("ColorfulMonorepo.workspaces");
  let collection: CollectionItem[] = [];
  const { packagesMap } = getAllPackages();

  const folders = workspace.workspaceFolders;
  if (folders) {
    for (const f of folders) {
      const p = folder2ModuleItem({ uri: f.uri }, packagesMap);
      !!p && push2DurableCollection(p, collection);
    }
  }

  await config.update("collection", collection, ConfigurationTarget.Workspace);
};

export const updateWorkspace = async function (packages: ModuleItem[] = []) {
  const config = getExtensionConfig("ColorfulMonorepo.workspaces");
  const rollback = config.get("collection");

  const folders = workspace.workspaceFolders;
  const collection: CollectionItem[] = [];
  for (const p of packages) {
    push2DurableCollection(p, collection);
  }

  // due to DrawerProvider will refresh TreeView before config update,
  // So need to update first.
  await config.update("collection", collection, ConfigurationTarget.Workspace);

  if (isSingleWorkspaceProject()) {
    await getExtensionConfig("files").update(
      "exclude",
      {},
      ConfigurationTarget.Workspace
    );

    await getExtensionConfig("ColorfulMonorepo.drawer").update(
      "init",
      false,
      ConfigurationTarget.Workspace
    );
  }

  const r = workspace.updateWorkspaceFolders(0, folders?.length, ...packages);

  if (!r) {
    // fail will rollback
    await config.update("collection", rollback, ConfigurationTarget.Workspace);
  }
};

export const selectWorkspacePackages = async function () {
  const { allPackages, packagesMap } = getAllPackages();
  const config = getExtensionConfig("ColorfulMonorepo.workspaces");
  let collection = (config.get("collection") as CollectionItem[]) ?? [];

  const folders = workspace.workspaceFolders;
  const directoryWorkspaceCollection = [];

  for (const c of collection) {
    c.folderAsWorkspace && directoryWorkspaceCollection.push(c);
  }

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

  const picked = await window.showQuickPick<ModuleItem>(allPackages, {
    canPickMany: true,
    matchOnDescription: true,
  });
  const m = collection2Modules(directoryWorkspaceCollection, packagesMap);

  picked?.length && updateWorkspace(picked.concat(m));
};

export const folderAsWorkspace = async function (_: any, items: Uri[]) {
  const { packagesMap } = getAllPackages();
  const cwd = getExtensionCwd();
  if (!cwd) {
    return;
  }
  let m: ModuleItem[] = [];

  const config = getExtensionConfig("ColorfulMonorepo.workspaces");
  let collection = (config.get("collection") as CollectionItem[]) ?? [];

  for await (let item of items) {
    const stat = await workspace.fs.stat(item);
    if (packagesMap.get(item.fsPath)) {
      window.showWarningMessage(
        `Can't add node project ${item.fsPath} as workspace`
      );
      continue;
    }

    if (stat.type === FileType.Directory) {
      const mi = folder2ModuleItem({ uri: item, folderAsWorkspace: true });
      if (mi) {
        m.push({ ...mi, ...{ folderAsWorkspace: true } });
      }
    }
  }

  const m2 = collection2Modules(collection, packagesMap);

  return updateWorkspace(m2.concat(m));
};

export const removeWorkspace = async function (_: any, items: Uri[]) {
  const { packagesMap } = getAllPackages();
  const config = getExtensionConfig("ColorfulMonorepo.workspaces");
  let collection = (config.get("collection") as CollectionItem[]) ?? [];
  const modules = collection2Modules(collection, packagesMap);

  for (const item of items) {
    for (let i = 0; i < modules.length; i++) {
      const m = modules[i];
      if (m.path === item.fsPath) {
        modules.splice(i, 1);
      }
    }
  }

  return updateWorkspace(modules);
};
