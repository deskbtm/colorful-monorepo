import { TextItem } from "../component/empty-item";
import { getExtensionConfig, humanFileList } from "../utils";
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
} from "vscode";
import micromatch from "micromatch";

type DrawerItem = WorkspaceItem | FileItem | TextItem;

export class DrawerProvider
  // extends EventEmitter<DrawerItem | undefined>
  implements TreeDataProvider<DrawerItem>
{
  private watchers = new Map();

  private _onDidChangeTreeData: EventEmitter<DrawerItem | undefined> =
    new EventEmitter<DrawerItem | undefined>();

  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private workspaceRoot: string) {
    // super();

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
    this._onDidChangeTreeData.fire(undefined);
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

          const fileList = humanFileList(folderUri, files);

          const items: DrawerItem[] = [];

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
