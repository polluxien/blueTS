import { commands, ExtensionContext } from "vscode";
import { Panel } from "./view/PanelClass";
import * as vscode from "vscode";

export function activate(context: ExtensionContext) {
  let currentPanel: Panel | undefined = undefined;

  try {
    //Erstelle Panel-Webview
    const showPanelCommand = commands.registerCommand(
      "react-ext.showPanel",
      () => {
        currentPanel = Panel.render(context.extensionUri);
      }
    );
    context.subscriptions.push(showPanelCommand);
  } catch (err: any) {
    vscode.window.showErrorMessage(
      "Error beim erstellen der Webview: ",
      err.message
    );
  }
}

export function deactivate() {}
