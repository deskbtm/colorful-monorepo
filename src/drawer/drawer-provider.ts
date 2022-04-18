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
  FileSystemWatcher,
  RelativePattern,
  FileType,
} from "vscode";

type DrawerItem = WorkspaceItem | FileItem;

export class DrawerProvider
  extends EventEmitter<DrawerItem | any>
  implements TreeDataProvider<DrawerItem>
{
  private fileWatcher!: FileSystemWatcher;

  constructor(private workspaceRoot: string) {
    super();
    workspace.workspaceFolders?.forEach((folder) => {
      this.fileWatcher = workspace.createFileSystemWatcher(
        new RelativePattern(folder.uri, "**​")
      );
      this.fileWatcher.onDidChange((e) => this.fire(e));
    });
  }

  getTreeItem(element: DrawerItem): TreeItem {
    return element;
  }

  getChildren(element?: DrawerItem): Thenable<DrawerItem[]> {
    if (!this.workspaceRoot) {
      window.showInformationMessage("Colorful Monorepo: Empty Root Workspace");
      return Promise.resolve([]);
    }

    return new Promise(async (resolve, reject) => {
      const folders = workspace.workspaceFolders;
      if (!folders) {
        reject([]);
        return;
      }

      if (element) {
        const config = getExtensionConfig("files");
        const exclude = config.get<Record<string, boolean>>("exclude");

        const folder = folders.find((v) => v.name === element.label);

        if (!folder) {
          reject([]);
          return;
        }

        const files = await workspace.fs.readDirectory(
          element.resourceUri ?? folder.uri
        );

        const fileList = humanFileList(folder.uri, files);

        const items: FileItem[] = [];

        for (const f of fileList) {
          items.push(
            new FileItem(
              f.uri,
              f.type === FileType.Directory
                ? TreeItemCollapsibleState.Collapsed
                : TreeItemCollapsibleState.None
            )
          );
        }

        resolve(items);
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

    // if (element) {
    //   return Promise.resolve(
    //     this.getDepsInPackageJson(
    //       path.join(
    //         this.workspaceRoot,
    //         "node_modules",
    //         element.label,
    //         "package.json"
    //       )
    //     )
    //   );
    // } else {
    //   const packageJsonPath = path.join(this.workspaceRoot, "package.json");
    //   if (this.pathExists(packageJsonPath)) {
    //     return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
    //   } else {
    //     window.showInformationMessage("Workspace has no package.json");
    //     return Promise.resolve([]);
    //   }
    // }
  }

  // private getDepsInPackageJson(packageJsonPath: string): DrawerItem[] {
  //   if (this.pathExists(packageJsonPath)) {
  //     const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  //     const toDep = (moduleName: string, version: string): DrawerItem => {
  //       if (
  //         this.pathExists(
  //           path.join(this.workspaceRoot, "node_modules", moduleName)
  //         )
  //       ) {
  //         // return new DrawerItem(
  //         //   moduleName,
  //         //   version,
  //         //   TreeItemCollapsibleState.Collapsed
  //         // );
  //       } else {
  //         // return new DrawerItem(
  //         //   moduleName,
  //         //   version,
  //         //   TreeItemCollapsibleState.None
  //         // );
  //       }
  //     };

  //     const deps = packageJson.dependencies
  //       ? Object.keys(packageJson.dependencies).map((dep) =>
  //           toDep(dep, packageJson.dependencies[dep])
  //         )
  //       : [];
  //     const devDeps = packageJson.devDependencies
  //       ? Object.keys(packageJson.devDependencies).map((dep) =>
  //           toDep(dep, packageJson.devDependencies[dep])
  //         )
  //       : [];
  //     return deps.concat(devDeps);
  //   } else {
  //     return [];
  //   }
  // }

  // private pathExists(p: string): boolean {
  //   try {
  //     fs.accessSync(p);
  //   } catch (err) {
  //     return false;
  //   }
  //   return true;
  // }
}

// class DrawerItem extends TreeItem {
//   constructor(
//     public override readonly label: string,
//     private version: string,
//     public override readonly collapsibleState: TreeItemCollapsibleState
//   ) {
//     super(label, collapsibleState);
//     this.tooltip = `${this.label}-${this.version}`;
//     this.description = this.version;
//   }

//   override iconPath = {
//     light: path.join(
//       __filename,
//       "..",
//       "..",
//       "resources",
//       "light",
//       "dependency.svg"
//     ),
//     dark: path.join(
//       __filename,
//       "..",
//       "..",
//       "resources",
//       "dark",
//       "dependency.svg"
//     ),
//   };
// }
