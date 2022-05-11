import {
  commands,
  ConfigurationTarget,
  ExtensionContext,
  TextEditor,
  workspace,
  WorkspaceFolder,
} from "vscode";
import debounce from "lodash.debounce";
import { window } from "vscode";
import {
  ConfirmActions,
  getExtensionConfig,
  getExtensionCwd,
  is,
  isWithin,
} from "./utils";

export const createAutoArrange = (context: ExtensionContext) => {
  const autoArrange = window.onDidChangeActiveTextEditor(
    debounce(async (e: TextEditor | undefined) => {
      const arrangeConfig = getExtensionConfig("ColorfulMonorepo.arrange");

      if (!arrangeConfig.get<boolean>("enabled")) {
        autoArrange.dispose();
        return;
      }

      if (!arrangeConfig.get<boolean>("init")) {
        await arrangeConfig.update("init", true, ConfigurationTarget.Workspace);

        const val = await window.showInformationMessage(
          "Monorepo: Do you want to open auto arrange ? it will clean all editors on startup.",
          ConfirmActions.YES as string,
          ConfirmActions.NO as string
        );

        if (val === ConfirmActions.YES) {
          await commands.executeCommand("workbench.action.closeAllEditors");
        } else {
          autoArrange.dispose();
          await arrangeConfig.update(
            "enabled",
            false,
            ConfigurationTarget.Workspace
          );
          return;
        }
      }

      const cwd = getExtensionCwd();
      const folders = workspace.workspaceFolders?.filter(
        (f) => cwd !== f.uri.fsPath
      );

      if (!Array.isArray(folders)) {
        return;
      }

      for (let i = 0; i < folders.length; i++) {
        const folder: WorkspaceFolder = folders[i];
        const isWithinWorkspace =
          e?.document.uri && isWithin(folder.uri.fsPath, e.document.uri.fsPath);

        if (isWithinWorkspace) {
          let tabs = context.workspaceState.get(
            folder.uri.fsPath
          ) as Set<string>;

          if (!!tabs && is.set(tabs)) {
            tabs.add(e.document.uri.fsPath);
          } else {
            tabs = new Set([e.document.uri.fsPath]);
          }
          context.workspaceState.update(folder.uri.fsPath, tabs);
        }
      }
    }, 100)
  );

  return autoArrange;
};
