import { commands, ExtensionContext, WebviewPanel } from "vscode";
import { Panel } from "./view/PanelClass";
import { TSClassAnalyzer } from "./tsCompilerApi/tsClassAnalyzer.class";
import ts from "typescript";
import { getAllTsFilesFromDirectory } from "./fileService/fileService";

export function activate(context: ExtensionContext) {
  let currentPanel: Panel | undefined = undefined;

  //Erstelle Panel-Webview
  const showPanelCommand = commands.registerCommand(
    "react-ext.showPanel",
    async () => {
      currentPanel = Panel.render(context.extensionUri);

      //hole alle Ts-Files von directory
      const scrFiles = await getAllTsFilesFromDirectory(
        "../src/ClassExample"
      );

      //instanzier TSClassAnalyzer
      const tsClasses = new TSClassAnalyzer(scrFiles, {
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS,
      });

      //schicke alle ClassRessources an Frontend
      currentPanel?.postMessage({
        command: "curClass",
        classes: tsClasses.parse(),
      });
    }
  );

  context.subscriptions.push(showPanelCommand);
}

export function deactivate() {}
