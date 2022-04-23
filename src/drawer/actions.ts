import { DrawerProvider } from "./drawer-provider";
import { ConfigurationTarget, TreeItem, Uri } from "vscode";
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

  if (key) {
    const e = JSON.parse(JSON.stringify(exclude));

    delete e[key];

    await fileConfig.update("exclude", e, ConfigurationTarget.Workspace);

    drawerProvider.refresh();
  }
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

  // const fileGlob =
};

export const move2Drawer = function (item?: FileItem) {
  const fileConfig = getExtensionConfig("files");
  const exclude = fileConfig.get<Record<string, boolean>>("exclude") ?? {};
};
