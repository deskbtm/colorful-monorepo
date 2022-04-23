/* eslint-disable @typescript-eslint/naming-convention */
import { glob } from "glob";
import { isAbsolute, join, normalize, relative } from "path";
import { ConfigurationTarget, FileType, Uri, workspace } from "vscode";
import { promisify } from "util";
import { stat } from "fs/promises";
import { Stats } from "fs";

export const globAsync = promisify(glob);

/**
 *
 * @param {String} [name="ColorfulMonorepo"] default "ColorfulMonorepo"
 * @returns
 */
export const getExtensionConfig = function (name = "ColorfulMonorepo") {
  return workspace.getConfiguration(name);
};

// get current extension working directory
export const getExtensionCwd = function () {
  return workspace.workspaceFolders?.[0].uri.fsPath;
};

/**
 * match emojis from settings
 */
export const matchEmoji = function (relative: string, isRoot = false) {
  const config = getExtensionConfig("ColorfulMonorepo.workspaces");

  if (!config) {
    return;
  }

  if (isRoot) {
    return config.get<string>("prefix.root");
  }

  const custom = config.get<{ regex: string; prefix: string }[]>("custom");

  if (custom?.length) {
    for (const c of custom) {
      if (c.prefix && c.regex && new RegExp(c.regex, "u").test(relative)) {
        return c.prefix;
      }
    }
  }

  for (const k of ["apps", "libs", "docs"]) {
    const regex = config.get<string>(`regex.${k}`);
    const prefix = config.get<string>(`prefix.${k}`);

    if (regex && prefix && new RegExp(regex, "u").test(relative)) {
      return prefix;
    }
  }
  return config.get<string>("prefix.unknown");
};

export const switchExperimentalFileNesting = function (enable?: boolean) {
  const explorerConfig = getExtensionConfig("explorer");
  const nestEnabled = explorerConfig.get("experimental.fileNesting.enabled");

  if (nestEnabled === undefined) {
    return;
  }

  if (enable !== nestEnabled) {
    explorerConfig.update(
      "experimental.fileNesting.enabled",
      enable,
      ConfigurationTarget.Workspace
    );
  }
};

export const randomColor = function () {
  var color = Math.floor(Math.random() * 16777215).toString(16);
  return "#" + ("000000" + color).slice(-6);
};

export const hex2RGB = function (hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

export const invertHexColor = function (hex: string) {
  let rgb = hex2RGB(hex);
  let luminance =
    rgb && 0.2126 * rgb["r"] + 0.7152 * rgb["g"] + 0.0722 * rgb["b"];
  return luminance && luminance < 140 ? "#ffffff" : "#000000";
};

export const autoGenerateColor = function () {
  const background = randomColor();
  const foreground = invertHexColor(background);
  return {
    background,
    foreground,
  };
};

/**
 *
 * @example
 * ```
 * isWithin('/foo', '/foo/bar') === true
 * isWithin('/foo', '/foo') === false
 *
 * ```
 */
export const isWithin = function (parent: string, child: string) {
  parent = normalize(parent);
  child = normalize(child);
  const r = relative(parent, child);
  return !isAbsolute(r) && !r.startsWith("..");
};

export enum SortType {
  KIND,
  TIMESTAMP,
}

interface HumanFile {
  name: string;
  type: FileType;
  uri: Uri;
}

interface FormattedFile {
  name: string;
  uri: Uri;
  stat: Stats;
  type: FileType;
}

export const getFiles = async (base: Uri, names: string[]) => {
  return Promise.all(
    names.map(async (n) => {
      const path = join(base.fsPath, n);
      const s = await stat(path);

      let type: FileType;
      if (s.isDirectory()) {
        type = FileType.Directory;
      } else if (s.isFile()) {
        type = FileType.File;
      } else if (s.isSymbolicLink()) {
        type = FileType.SymbolicLink;
      } else {
        type = FileType.Unknown;
      }

      return {
        name: n,
        uri: Uri.file(path),
        stat: s,
        type,
      };
    })
  );
};

/**
 *
 * convert {@link FileSystem.readDirectory} result readable
 *
 * @param base
 * @param files
 * @param sortType
 */
export const humanFileList = (files: FormattedFile[]): HumanFile[] => {
  const fileList: HumanFile[] = [];
  const folderList: HumanFile[] = [];

  for (const f of files) {
    if (f.type === FileType.Directory) {
      folderList.push(f);
    } else {
      fileList.push(f);
    }
  }

  folderList.sort((p, n) => p.name.localeCompare(n.name));
  fileList.sort((p, n) => p.name.localeCompare(n.name));

  return folderList.concat(fileList);
};

export const humanFileList1 = (
  base: Uri,
  files: [string, FileType][]
): HumanFile[] => {
  const fileList: HumanFile[] = [];
  const folderList: HumanFile[] = [];

  for (const f of files) {
    const [name, type] = f;
    const fo = { name, type, uri: Uri.joinPath(base, name) };
    if (type === FileType.Directory) {
      folderList.push(fo);
    } else {
      fileList.push(fo);
    }
  }

  folderList.sort((p, n) => p.name.localeCompare(n.name));
  fileList.sort((p, n) => p.name.localeCompare(n.name));

  return folderList.concat(fileList);
};
