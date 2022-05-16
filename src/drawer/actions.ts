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
export const moveOut = async function (items: FileItem[], all?: boolean) {
  const fileConfig = getExtensionConfig("files");

  if (all) {
    await fileConfig.update("exclude", {}, ConfigurationTarget.Workspace);
    return;
  }

  const exclude = fileConfig.get<Record<string, boolean>>("exclude") ?? {};
  const e = JSON.parse(JSON.stringify(exclude));

  for (const item of items) {
    for (const k in e) {
      if (
        new RegExp(item.filename).test(k) ||
        micromatch.isMatch(item.filename, k, {
          dot: true,
        })
      ) {
        delete e[k];
      }
    }
  }

  if (e) {
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
};
