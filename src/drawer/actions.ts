import { DrawerProvider } from "./drawer-provider";
import { ConfigurationTarget, TreeItem, Uri, window, workspace } from "vscode";
import { getExtensionConfig } from "../utils";
import { FileItem } from "./file-item";
import path from "path";

export const moveOut = async function (
  item: FileItem,
  drawerProvider: DrawerProvider
) {
  const fileConfig = getExtensionConfig("files");
  const exclude = fileConfig.get<Record<string, boolean>>("exclude") ?? {};

  let key: string | undefined;

  for (const k in exclude) {
    if (new RegExp(item.filename).test(k)) {
      key = k;
      break;
    }
  }
  const e = JSON.parse(JSON.stringify(exclude));

  if (key) {
    delete e[key];
  } else {
    e["!(" + item.filename + ")"] = true;
  }

  await fileConfig.update("exclude", e, ConfigurationTarget.Workspace);
  drawerProvider.refresh();
};

export const move2DrawerGlobHandler = async function (
  item: Uri,
  drawerProvider: DrawerProvider
) {
  const fileConfig = getExtensionConfig("files");
  const exclude = fileConfig.get<Record<string, boolean>>("exclude") ?? {};

  if (item) {
    const basename = path.basename(item.fsPath);
    exclude["**/" + basename] = true;
    await fileConfig.update("exclude", exclude, ConfigurationTarget.Workspace);
    drawerProvider.refresh();
  }
};

export const deleteFile = async function (item: FileItem) {
  if (item) {
    await workspace.fs
      .delete(item.resourceUri, {
        recursive: true,
        useTrash: true,
      })
      .then(
        () => {},
        () => {
          window.showErrorMessage(`Delete ${item.resourceUri}`);
        }
      );
  }
};

export const toggleExclude = async function (v: boolean) {
  const fileConfig = getExtensionConfig("files");
  const exclude = fileConfig.get<Record<string, boolean>>("exclude") ?? {};

  for (const key in exclude) {
    exclude[key] = v;
  }

  await fileConfig.update("exclude", exclude, ConfigurationTarget.Workspace);
  // drawerProvider.refresh();
};
