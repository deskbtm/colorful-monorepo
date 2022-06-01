import { CollectionItem } from "../interface";
import { TextItem } from "../component/empty-item";
import {
  getExtensionConfig,
  humanFileList,
  disposeAll,
  getPackage,
  ConfirmActions,
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
  WorkspaceFolder,
} from "vscode";
import micromatch from "micromatch";
import {
  deleteFile,
  move2DrawerGlobHandler,
  moveOut,
  toggleExclude,
} from "./actions";
import { PackageInfo } from "@deskbtm/workspace-tools";

type DrawerItem = WorkspaceItem | FileItem | TextItem;

export class DrawerProvider
  extends EventEmitter<DrawerItem | undefined>
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
      async () => {
        await toggleExclude(false);
        this.refresh();
      }
    );

    const move2DrawerByGlob = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.move2",
      async (_, items) => {
        await move2DrawerGlobHandler(items);
        this.refresh();
      }
    );

    const hideCmdDrawer = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.hide",
      async () => {
        await toggleExclude(true);
        this.refresh();
      }
    );

    // Delete file directly in drawer
    const deleteCmd = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.delete",
      (item) => {
        deleteFile(item).then(() => {
          this.refresh();
        });
      }
    );

    const moveOutCmd = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.moveOut",
      async (item: FileItem, items: FileItem[]) => {
        await moveOut(items ?? [item]);
        this.refresh();
      }
    );

    const moveOutAllCmd = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.moveOutAll",
      async (_: any, items: FileItem[]) => {
        await moveOut(items, true);
        this.refresh();
      }
    );

    const editWorkspaceFile = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.editWorkspaceFile",
      async () => {
        commands.executeCommand("vscode.open", workspace.workspaceFile);
      }
    );

    const presetExclude = commands.registerCommand(
      "com.deskbtm.ColorfulMonorepo.drawer.preset",
      this.#presetExclude
    );

    workspace.workspaceFolders?.forEach((folder) => {
      this.#add2WatchFs(folder.uri);
    });

    const workspaceListener = workspace.onDidChangeWorkspaceFolders((e) => {
      e.added.forEach((e) => {
        this.#add2WatchFs(e.uri);
      });

      e.removed.forEach((e) => {
        this.#watchers.get(e.uri.fsPath)?.dispose();
        this.#watchers.delete(e.uri.fsPath);
      });
      this.refresh();
    });

    this.#disposables.push(
      drawerRefresh,
      showCmdDrawer,
      hideCmdDrawer,
      moveOutCmd,
      deleteCmd,
      move2DrawerByGlob,
      workspaceListener,
      moveOutAllCmd,
      editWorkspaceFile,
      presetExclude
    );
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

  #presetExclude = async () => {
    const fileConfig = workspace.getConfiguration("files");
    const drawerConfig = getExtensionConfig("ColorfulMonorepo.drawer");

    const excludeConfigs: Record<string, boolean> | undefined =
      drawerConfig.get("exclude");

    const val = await window.showInformationMessage(
      `Monorepo: Init the default file excludes ? \n
      ${Object.keys(excludeConfigs!).join("\n")}
      `,
      ConfirmActions.YES as string,
      ConfirmActions.NO as string
    );

    await fileConfig.update(
      "exclude",
      val === ConfirmActions.YES ? excludeConfigs : {},
      ConfigurationTarget.Workspace
    );
    this.refresh();
  };

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

  #createExtraGlobs(exclude: Record<string, boolean>) {
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
    let collection = config.get("collection") as CollectionItem[];

    const singleWorkspace = workspace.workspaceFolders?.[0] as WorkspaceFolder;

    if (!this.workspaceRoot && !singleWorkspace) {
      window.showInformationMessage("Monorepo: Empty Root Workspace");
      return Promise.resolve([]);
    }

    if (collection?.length < 1) {
      collection = [
        {
          label: singleWorkspace.name,
          path: singleWorkspace.uri.fsPath,
        },
      ];
    }

    return new Promise(async (resolve, reject) => {
      const fileConfig = getExtensionConfig("files");
      const exclude = fileConfig.get<Record<string, boolean>>("exclude") ?? {};
      const globs = this.#createExtraGlobs(exclude);

      if (element) {
        try {
          const drawerConfig = getExtensionConfig("ColorfulMonorepo.drawer");
          const ignore = drawerConfig.get<string[]>("ignore");

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

        for await (const f of collection) {
          const pkg = getPackage(f.packageName) as PackageInfo;
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
