import ts, { Path } from "typescript";
import * as vscode from "vscode";
import { getAllTsFilesFromDirectory } from "../fileService/fileService";
import { ClassResource } from "../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "./TSClassAnalyzer.class";

let myWorkingPath = "";

export async function getAllClasses(path?: Path): Promise<ClassResource[]> {
  //benutzte aktuellen Workspace oder ausgewählten Workspace
  let currentWorkspace = !path
    ? vscode.workspace.workspaceFolders?.[0].uri.fsPath
    : path;

  //bekomme alle TS-Files von ausgewählter Ordnerstrucktur
  const scrFiles = await getAllTsFilesFromDirectory(currentWorkspace!);

  //Erstelle ClasenRessources
  const tsClasses = new TSClassAnalyzer(scrFiles);
  return tsClasses.parse();
}

export async function getAllFunctions(path?: Path): Promise<ClassResource[]> {
  //benutzte aktuellen Workspace oder ausgewählten Workspace
  let currentWorkspace = !path
    ? vscode.workspace.workspaceFolders?.[0].uri.fsPath
    : path;

  //bekomme alle TS-Files von ausgewählter Ordnerstrucktur
  const scrFiles = await getAllTsFilesFromDirectory(currentWorkspace!);

  //Erstelle ClasenRessources
  const tsClasses = new TSClassAnalyzer(scrFiles);
  return tsClasses.parse();
}
