import { DurableWorkspaceItem } from "../interface";
import { TextItem } from "../component/empty-item";
import {
  getExtensionConfig,
  humanFileList,
  disposeAll,
  getPackage,
} from "../utils";
import { FileItem } from "./file-item";
import { WorkspaceItem } from "./workspace-item";
import {
  TreeDataProvider,
  workspace,
  TreeItem,
  window,
  TreeItemCollapsibleState,
  EventEmitter,
  RelativePattern,
  FileType,
  Uri,
  ThemeIcon,
  Disposable,
  commands,
  FileSystemWatcher,
  ConfigurationTarget,
} from "vscode";
import micromatch from "micromatch";
import { deleteFile, moveOut, toggleExclude } from "./actions";

type DrawerItem = WorkspaceItem | FileItem | TextItem;

export class DrawerProvider
  extends EventEmitter<DrawerItem[] | undefined>
  implements TreeDataProvider<DrawerItem>, Disposable
{
  #watchers = new Map<string, FileSystemWatcher>();
  #disposables: Disposable[] = [];
  readonly onDidChangeTreeData = this.event;

  constructor(private workspaceRoot: string) {
    super();

    const drawerRefresh = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.refresh",
      () => {
        this.refresh();
      }
    );

    const showCmdDrawer = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.show",
      () => toggleExclude(false)
    );

    const hideCmdDrawer = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.hide",
      () => toggleExclude(true)
    );

    // Delete file directly in drawer
    const deleteCmdDrawer = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.delete",
      (item) => {
        deleteFile(item).then(() => {
          this.refresh();
        });
      }
    );

    const moveOutCmdDrawer = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.moveOut",
      (item) => {
        moveOut(item, this);
      }
    );

    this.#disposables.push(
      drawerRefresh,
      showCmdDrawer,
      hideCmdDrawer,
      moveOutCmdDrawer,
      deleteCmdDrawer
    );

    workspace.workspaceFolders?.forEach((folder) => {
      this.#add2WatchFs(folder.uri);
    });

    workspace.onDidChangeWorkspaceFolders((e) => {
      e.added.forEach((e) => {
        this.#add2WatchFs(e.uri);
      });

      e.removed.forEach((e) => {
        this.#watchers.get(e.uri.fsPath)?.dispose();
        this.#watchers.delete(e.uri.fsPath);
      });
      this.refresh();
    });

    this.#initDefaultConfiguration();
  }

  override dispose(): void {
    disposeAll(this.#disposables);
    for (const w of this.#watchers) {
      w?.[1]?.dispose();
    }
    this.#watchers.clear();
  }

  public refresh(): void {
    this.fire(undefined);
  }

  async #initDefaultConfiguration() {
    const fileConfig = workspace.getConfiguration("files");
    const drawerConfig = getExtensionConfig("ColorfulMonorepo.drawer");
    if (!drawerConfig.get("init")) {
      await drawerConfig.update("init", true, ConfigurationTarget.Workspace);
      await await fileConfig.update(
        "exclude",
        drawerConfig.get("exclude"),
        ConfigurationTarget.Workspace
      );

      this.refresh();
    }
  }

  #add2WatchFs(uri: Uri) {
    const watcher = workspace.createFileSystemWatcher(
      new RelativePattern(uri, "**")
    );

    this.#watchers.set(uri.fsPath, watcher);
    watcher.onDidCreate(() => {
      this.refresh();
    });
    watcher.onDidDelete(() => {
      this.refresh();
    });
  }

  #getExcludeGlobs(exclude: Record<string, boolean>) {
    const fileExclude = [];
    const externalExclude = [];

    for (const key in exclude) {
      if (exclude[key]) {
        fileExclude.push(key);
        externalExclude.push(key + "/**/*");
      }
    }

    return fileExclude.concat(externalExclude);
  }

  getTreeItem(element: DrawerItem): TreeItem {
    return element;
  }

  getChildren(element?: DrawerItem): Thenable<DrawerItem[]> {
    const config = getExtensionConfig("ColorfulMonorepo.workspaces");
    const collection = config.get<DurableWorkspaceItem[]>(
      "collection"
    ) as DurableWorkspaceItem[];

    if (!this.workspaceRoot && !collection) {
      window.showInformationMessage("Monorepo: Empty Root Workspace");
      return Promise.resolve([]);
    }

    return new Promise(async (resolve, reject) => {
      if (element) {
        try {
          const fileConfig = getExtensionConfig("files");
          const drawerConfig = getExtensionConfig("ColorfulMonorepo.drawer");
          const exclude =
            fileConfig.get<Record<string, boolean>>("exclude") ?? {};
          const ignore = drawerConfig.get<string[]>("ignore");

          const globs = this.#getExcludeGlobs(exclude);

          const folderUri =
            element.resourceUri ??
            Uri.file(collection.find((v) => v.label === element.label)?.path!);

          const files = await workspace.fs.readDirectory(folderUri);

          const fileList = humanFileList(folderUri, files);

          const items: DrawerItem[] = [];

          for (let f of fileList) {
            const r = micromatch.isMatch(f.uri.path, globs, {
              dot: true,
              ignore,
            });

            const isDirectory = f.type === FileType.Directory;

            if (r || isDirectory) {
              items.push(
                new FileItem(
                  f.uri,
                  isDirectory
                    ? TreeItemCollapsibleState.Collapsed
                    : TreeItemCollapsibleState.None,
                  f.name,
                  f.uri.fsPath,
                  f.type === FileType.File || f.type === FileType.SymbolicLink
                    ? {
                        title: "Monorepo Drawer: Open File",
                        command: "vscode.open",
                        arguments: [f.uri],
                        tooltip: `Click to open ${f.uri.fsPath}`,
                      }
                    : undefined
                )
              );
            }
          }

          if (items.length < 1) {
            items.push(new TextItem("Empty", new ThemeIcon("warning")));
          }

          resolve(items);
        } catch (error) {
          reject([]);
        }
      } else {
        const items = [];

        for (const f of collection) {
          const pkg = getPackage(f.packageName);
          items.push(
            new WorkspaceItem(
              f.label,
              TreeItemCollapsibleState.Collapsed,
              pkg?.version,
              f.label
            )
          );
        }

        resolve(items);
      }
    });
  }
}
