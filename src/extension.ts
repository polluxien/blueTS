import { commands, ExtensionContext } from "vscode";
import { Panel } from "./PanelClass";

export function activate(context: ExtensionContext) {
  //Erstelle Panel-Webview
  const showPanelCommand = commands.registerCommand(
    "react-ext.showPanel",
    () => {
      Panel.render(context.extensionUri);
    }
  );

  context.subscriptions.push(showPanelCommand);
}

export function deactivate() {}
