import { getExtensionConfig, humanFileList1 } from "../utils";
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
} from "vscode";
import minimatch from "minimatch";
import path from "path";
import micromatch from "micromatch";

type DrawerItem = WorkspaceItem | FileItem;

export class DrawerProvider
  extends EventEmitter<DrawerItem | undefined>
  implements TreeDataProvider<DrawerItem>
{
  private watchers = new Map();

  readonly onDidChangeTreeData = this.event;

  constructor(private workspaceRoot: string) {
    super();
    workspace.workspaceFolders?.forEach((folder) => {
      this.#add2Watch(folder.uri);
    });

    workspace.onDidChangeWorkspaceFolders((e) => {
      e.added.forEach((e) => {
        this.#add2Watch(e.uri);
      });

      e.removed.forEach((e) => {
        this.watchers.delete(e.uri.fsPath);
      });
    });
  }

  public refresh(): void {
    this.fire(undefined);
  }

  #add2Watch(uri: Uri) {
    const watcher = workspace.createFileSystemWatcher(
      new RelativePattern(uri, "**​")
    );

    this.watchers.set(uri.fsPath, watcher);
    watcher.onDidChange(() => this.refresh());
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
    if (!this.workspaceRoot) {
      window.showInformationMessage("Colorful Monorepo: Empty Root Workspace");
      return Promise.resolve([]);
    }

    const folders = workspace.workspaceFolders ?? [];

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
            (folders.find((v) => v.name === element.label)?.uri as Uri);

          const files = await workspace.fs.readDirectory(folderUri);

          const fileList = humanFileList1(folderUri, files);

          const items: FileItem[] = [];

          for (let f of fileList) {
            const r = micromatch.isMatch(f.uri.path, globs, {
              dot: true,
              ignore,
            });

            if (r) {
              items.push(
                new FileItem(
                  f.uri,
                  f.type === FileType.Directory
                    ? TreeItemCollapsibleState.Collapsed
                    : TreeItemCollapsibleState.None
                )
              );
            }
          }
          resolve(items);
        } catch (error) {
          reject([]);
        }
      } else {
        const items = [];

        for (const f of folders) {
          items.push(
            new WorkspaceItem(f.name, TreeItemCollapsibleState.Collapsed)
          );
        }

        resolve(items);
      }
    });
  }
}
