import { commands, ExtensionContext } from "vscode";
import { Panel } from "./PanelClass";
import * as vscode from "vscode";
import { hasTsFilesInDirectory } from "./services/fileService/fileService";
import { ReturnStatement } from "ts-morph";

/**
 * https://code.visualstudio.com/api/get-started/extension-anatomy
 *
 * @param context
 */
let currentPanel: Panel | undefined = undefined;

const showInformation = () =>
  vscode.window.showInformationMessage("redJ geöffnet ");

export async function activate(context: ExtensionContext) {
  try {
    //öffne view über Command-Palette -> immer möglich
    const openFromCommandPalettCommand = commands.registerCommand(
      "redj-ext.openFromCommandPalett",
      () => {
        if (currentPanel) {
          currentPanel.triggerDispose();
        }
        //Erstelle Panel-Webview
        currentPanel = Panel.render(context.extensionUri);
        showInformation();
      }
    );
    context.subscriptions.push(openFromCommandPalettCommand);

    const openFromToolbarCommand = commands.registerCommand(
      "redj-ext.openFromToolbar",
      () => {
        if (currentPanel) {
          currentPanel.triggerDispose();
        }
        currentPanel = Panel.render(context.extensionUri);
        showInformation();
      }
    );
    context.subscriptions.push(openFromToolbarCommand);

    //inital toolbar -> wird nur in toolbar angezeigt wenn ts-Files verfügbar
    await updateToolbarVisibility();

    // * VSCode trigger ------------------------------------------

    //File-change hat stattgefunden
    context.subscriptions.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === "typescript") {
          updateDiagnostics(event.document);
        }
      })
    );

    //File-save hat stattgefunden
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === "typescript") {
          updateDiagnostics(document);
        }
      })
    );

    //File-create hat stattgefunden
    context.subscriptions.push(
      vscode.workspace.onDidCreateFiles(async (event) => {
        const hasTsFiles = event.files.some((file) =>
          file.fsPath.endsWith(".ts")
        );
        if (hasTsFiles) {
          await updateToolbarVisibility();
        }
      })
    );

    //File-create hat stattgefunden
    context.subscriptions.push(
      vscode.workspace.onDidDeleteFiles(async (event) => {
        const deletedTsFiles = event.files.some((file) =>
          file.fsPath.endsWith(".ts")
        );
        if (deletedTsFiles) {
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
  } catch (err: any) {
    vscode.window.showErrorMessage(
      "Error beim erstellen der Extension: ",
      err.message
    );
  }
}

async function updateDiagnostics(document: vscode.TextDocument) {}

//schaue ob ts-Files im aktuellen Verzeichnis, wenn ja zeige startIcon in toolbar
async function updateToolbarVisibility() {
  const hasTsFiles = await hasTsFilesInDirectory();
  vscode.commands.executeCommand(
    "setContext",
    "redj-ext.hasTsFiles",
    hasTsFiles
  );
}

export function deactivate() {}
