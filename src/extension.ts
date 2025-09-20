import { commands, ExtensionContext } from "vscode";
import { Panel } from "./PanelClass";
import * as vscode from "vscode";
import { hasTsFilesInDirectory } from "./services/fileService/fileService";
import { ReturnStatement } from "ts-morph";
import { dropFilesFromTestedFileMap } from "./services/nodeVM/checkTsCodeManager";

/**
 * https://code.visualstudio.com/api/get-started/extension-anatomy
 *
 * @param context
 */
let currentPanel: Panel | undefined = undefined;
let showToolbarIcon: boolean = false;

const showInformation = () =>
  vscode.window.showInformationMessage("redJ geöffnet ");

export async function activate(context: ExtensionContext) {
  try {
    //stelle zum Anfang fest ob tsFiles im workspace
    await updateToolbarVisibility();

    //öffne view über Command-Palette -> immer möglich
    //öffne view über toolbar -> if extHasTsFiles
    const openFromToolbarCommand = commands.registerCommand(
      "redj.openExtension",
      () => {
        createPanel(context);
      }
    );
    context.subscriptions.push(openFromToolbarCommand);

    // * VSCode trigger ------------------------------------------

    // ? VSCODE show Toolbar Icon events
    //File-create hat stattgefunden
    context.subscriptions.push(
      vscode.workspace.onDidCreateFiles(async (event) => {
        const hasTsFiles = event.files.some((file) =>
          file.fsPath.endsWith(".ts")
        );
        if (hasTsFiles && !showToolbarIcon) {
          console.log("TS-FILE created ");
          await updateToolbarVisibility();
        }
      })
    );

    //File-delete hat stattgefunden
    context.subscriptions.push(
      vscode.workspace.onDidDeleteFiles(async (event) => {
        const deletedTsFiles = event.files.some((file) =>
          file.fsPath.endsWith(".ts")
        );
        if (deletedTsFiles && showToolbarIcon) {
          console.log("TS-FILE Deleted ");
          await updateToolbarVisibility();
        }
      })
    );

    // Workspace-Ordner geändert
    context.subscriptions.push(
      vscode.workspace.onDidChangeWorkspaceFolders(async () => {
        await updateToolbarVisibility();
      })
    );

    // ? VSCode update checkResources
    //File-change hat stattgefunden
    /*
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === "typescript"  && currentPanel) {
          updateDiagnostics(event.document);
        }
      })
    );
    */

    //File-save hat stattgefunden
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === "typescript" && currentPanel) {
          updateDiagnostics(document);
        }
      })
    );
  } catch (err: any) {
    vscode.window.showErrorMessage(
      "Error beim erstellen der Extension: ",
      err.message
    );
  }
}

function createPanel(context: ExtensionContext) {
  if (currentPanel) {
    currentPanel.triggerDispose();
  }
  //Erstelle Panel-Webview
  currentPanel = Panel.render(context.extensionUri);
  showInformation();
}

//schaue ob ts-Files im aktuellen Verzeichnis, wenn ja zeige startIcon in toolbar
async function updateToolbarVisibility() {
  showToolbarIcon = await hasTsFilesInDirectory();
  /**
   * https://code.visualstudio.com/api/references/contribution-points#contributes.views
   */
  vscode.commands.executeCommand(
    "setContext",
    "extHasTsFiles",
    showToolbarIcon
  );
}

async function updateDiagnostics(document: vscode.TextDocument) {
  console.log("Das ist die DocunmenetURI: ", document.uri);
  const newTestedFilesMap = dropFilesFromTestedFileMap(document.uri);
  currentPanel?.postMessage({
    command: "postTsCodeCheckMap",
    data: newTestedFilesMap,
  });
}

export function deactivate() {}
