import {
  ConfigurationTarget,
  Disposable,
  ExtensionContext,
  TextEditor,
  workspace,
} from "vscode";
import debounce from "lodash.debounce";
import { window } from "vscode";
import { getExtensionConfig } from "./utils";

enum ConfirmActions {
  YES = "Yes",
  NO = "No",
}

export const createAutoArrange = (context: ExtensionContext) => {
  const autoArrange = window.onDidChangeActiveTextEditor(
    debounce(async (e: TextEditor | undefined) => {
      console.log(workspace.textDocuments);
      const arrangeConfig = getExtensionConfig("ColorfulMonorepo.arrange");

      if (!arrangeConfig.get<boolean>("enabled")) {
        autoArrange.dispose();
        return;
      }

      const val = await window.showInformationMessage(
        "Monorepo: Do you want to open auto arrange ? it will clean all editors on startup.",
        ConfirmActions.YES as string,
        ConfirmActions.NO as string
      );

      if (val === ConfirmActions.YES) {
      } else {
        autoArrange.dispose();
        arrangeConfig.update("enabled", false, ConfigurationTarget.Workspace);
      }

      // if (val === 'Yes') {

      // }

      const folders = workspace.workspaceFolders;
      console.log(folders);

      console.log(window.visibleTextEditors);

      // commands.executeCommand("moveActiveEditor", {
      //   to: "first",
      //   by: "tab",
      // });
    }, 100)
  );
  return autoArrange;
};
