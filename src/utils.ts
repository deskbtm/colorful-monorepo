import { workspace, WorkspaceConfiguration } from "vscode";

export const getExtensionConfig = function (name = "ColorfulMonorepo") {
  return workspace.getConfiguration(name);
};

// get current extension working directory
export const getExtensionCwd = function () {
  return workspace.workspaceFolders?.[0].uri.fsPath;
};

export const matchEmoji = function (relative: string, isRoot = false) {
  const config = getExtensionConfig("ColorfulMonorepo.packages");

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

  for (const k of ["apps", "libs", "tools"]) {
    const regex = config.get<string>(`regex.${k}`);
    const prefix = config.get<string>(`prefix.${k}`);

    if (regex && prefix && new RegExp(regex, "u").test(relative)) {
      return prefix;
    }
  }
  return config.get<string>("prefix.unknown");
};
