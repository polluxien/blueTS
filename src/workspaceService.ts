import * as vscode from "vscode";

let currentWorkspace: string | undefined;

export function getWorkspace(): string {
  //per default ersteinaml aktuell geöffneter workspace
  if (!currentWorkspace) {
    currentWorkspace = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
  }
  return currentWorkspace!;
}

export function setWorkspace(newWorkspace: string) {
  currentWorkspace = newWorkspace;
}
