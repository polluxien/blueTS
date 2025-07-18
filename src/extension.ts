import { commands, ExtensionContext, WebviewPanel } from "vscode";
import { Panel } from "./view/PanelClass";
import { TSClassAnalyzer } from "./tsCompilerApi/tsClassAnalyzer.class";
import ts from "typescript";
import * as vscode from "vscode";
import { getAllTsFilesFromDirectory } from "./fileService/fileService";

export function activate(context: ExtensionContext) {
  let currentPanel: Panel | undefined = undefined;
  let currentWorkspace = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  //let currentWorkspace ="/Users/bennet/Bachelor-Side-Projects/TypeScript-AST-Parsing/src/ClassExample";

  try {
    //Erstelle Panel-Webview
    const showPanelCommand = commands.registerCommand(
      "react-ext.showPanel",
      async () => {
        currentPanel = Panel.render(context.extensionUri);
        //warte bis Frontend signal schickt das es bereit ist
        console.log("Ausgabe vor async");

        await currentPanel!.waitForReady();
        console.log("Workspace: ", currentWorkspace);

        //hole alle Ts-Files von directory
        if (!currentWorkspace) {
          vscode.window.showWarningMessage("Kein Workspace zur verfügung ");
          return;
        }
        const scrFiles = await getAllTsFilesFromDirectory(currentWorkspace!);

        //instanzier TSClassAnalyzer
        const tsClasses = new TSClassAnalyzer(scrFiles, {
          target: ts.ScriptTarget.ES5,
          module: ts.ModuleKind.CommonJS,
        });

        //schicke alle ClassRessources an Frontend
        currentPanel!.postMessage({
          command: "postClasses",
          data: tsClasses.parse(),
        });
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
