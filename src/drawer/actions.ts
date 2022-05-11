import { DrawerProvider } from "./drawer-provider";
import { ConfigurationTarget, TreeItem, Uri, window, workspace } from "vscode";
import { getExtensionConfig } from "../utils";
import { FileItem } from "./file-item";
import path from "path";
import micromatch from "micromatch";

/**
 *
 * @param {FileItem} item
 * @param {boolean} all move out all exclude files
 */
export const moveOut = async function (item: FileItem, all?: boolean) {
  const fileConfig = getExtensionConfig("files");

  if (all) {
    await fileConfig.update("exclude", {}, ConfigurationTarget.Workspace);
  }

  const exclude = fileConfig.get<Record<string, boolean>>("exclude") ?? {};

  let key: string | undefined;

  for (const k in exclude) {
    if (
      new RegExp(item.filename).test(k) ||
      micromatch.isMatch(item.filename, k, {
        dot: true,
      })
    ) {
      key = k;
      break;
    }
  }

  if (key) {
    const e = JSON.parse(JSON.stringify(exclude));
    delete e[key];
    await fileConfig.update("exclude", e, ConfigurationTarget.Workspace);
  }
};

export const move2DrawerGlobHandler = async function (items: Uri[]) {
  const fileConfig = getExtensionConfig("files");
  const exclude = fileConfig.get<Record<string, boolean>>("exclude") ?? {};
  if (items) {
    for (const item of items) {
      const basename = path.basename(item.fsPath);
      exclude["**/" + basename] = true;
    }
    // console.log(exclude);
    await fileConfig.update("exclude", exclude, ConfigurationTarget.Workspace);
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
