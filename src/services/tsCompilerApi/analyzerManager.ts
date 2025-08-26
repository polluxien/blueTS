import {
  ClassResource,
  FunctionResource,
} from "../../_resources/tsCompilerAPIResources";
import { TSFunctionAnalyzer } from "./TSFunctionAnalyzer.class";
import { TSClassAnalyzer } from "./TSClassAnalyzer.class";
import { getTSFiles } from "../fileService/fileService";

export async function getAlltsClasses(): Promise<ClassResource[]> {
  //Erstelle ClassResources
  const tsClasses = new TSClassAnalyzer(await getTSFiles());
  return tsClasses.parse();
}

export async function getAlltsFunctions(): Promise<FunctionResource[]> {
  //Erstelle FunctionResources
  const tsfunctions = new TSFunctionAnalyzer(await getTSFiles());
  return tsfunctions.parse();
}

// ! muss noch implementiert werden
/*
export async function getSpefictsClass(path?: Path): Promise<ClassResource[]> {
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
  */
