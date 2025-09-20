import * as vscode from "vscode";
import fs from "fs";
import { getTSFiles } from "./fileService/fileService";
import { DirectoryRespondeType } from "../_resources/response/directoryResponde";

const vsWorkspace = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
let currentWorkspace: string | undefined;

export function getWorkspace(): string {
  //per default erst einaml aktuell geöffneter workspace
  if (!currentWorkspace) {
    setWorkspace(true);
  }
  return currentWorkspace!;
}

export async function getWorkspaceRessourceForMessage(): Promise<DirectoryRespondeType> {
  const files = await getTSFiles();

  return {
    currentWorkspace: getWorkspace(),
    fileCount: files.length,
  };
}

export async function setWorkspace(useDefault: boolean, newWorkspace?: string) {
  const targetPath = useDefault ? vsWorkspace : newWorkspace;

  if (!targetPath) {
    throw new Error(`kein Pfad verfügbar`);
  }

  //überprüfen ob Pfad exestiert
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Pfad ${targetPath} exestiert nicht`);
  }

  //überprüfen ob Pfad directory ist
  const stat = fs.statSync(targetPath);
  if (!stat.isDirectory()) {
    throw new Error(`Pfad ${targetPath} ist keine directory`);
  }

  currentWorkspace = targetPath;
}
