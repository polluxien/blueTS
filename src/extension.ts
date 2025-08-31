import { commands, ExtensionContext } from "vscode";
import { Panel } from "./PanelClass";
import * as vscode from "vscode";

export function activate(context: ExtensionContext) {
  let currentPanel: Panel | undefined = undefined;

  const showInformation = () =>
    vscode.window.showInformationMessage("redJ geöffnet ");

  try {
    //öffne view über Command-Palette
    const showPanelCommand = commands.registerCommand(
      "react-ext.openFromCommandPalett",
      () => {
        //Erstelle Panel-Webview
        currentPanel = Panel.render(context.extensionUri);
        showInformation();
      }
    );
    context.subscriptions.push(showPanelCommand);

    //öffne view über toolbar
    const openFromToolbarCommand = commands.registerCommand(
      "react-ext.openFromToolbar",
      () => {
        //Erstelle Panel-Webview
        currentPanel = Panel.render(context.extensionUri);
        showInformation();
      }
    );
    context.subscriptions.push(openFromToolbarCommand);
  } catch (err: any) {
    vscode.window.showErrorMessage(
      "Error beim erstellen der Webview: ",
      err.message
    );
  }
}

export function deactivate() {}
