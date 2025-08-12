import ts, { Path } from "typescript";
import * as vscode from "vscode";
import { getAllTsFilesFromDirectory } from "../fileService/fileService";
import {
  ClassResource,
  FunctionResource,
} from "../_resources/tsCompilerAPIResources";
import { TSClassAnalyzer } from "./TSClassAnalyzer.class";
import { TSFunctionAnalyzer } from "./TSFunctionAnalyzer.class";

let myWorkingPath = "";

export async function getAlltsClasses(path?: Path): Promise<ClassResource[]> {
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

export async function getAlltsFunctions(
  path?: Path
): Promise<FunctionResource[]> {
  //benutzte aktuellen Workspace oder ausgewählten Workspace
  let currentWorkspace = !path
    ? vscode.workspace.workspaceFolders?.[0].uri.fsPath
    : path;

  //bekomme alle TS-Files von ausgewählter Ordnerstrucktur
  const scrFiles = await getAllTsFilesFromDirectory(currentWorkspace!);

  //Erstelle ClasenRessources
  const tsfunctions = new TSFunctionAnalyzer(scrFiles);
  return tsfunctions.parse();
}
