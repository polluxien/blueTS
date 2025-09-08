import {
  ClassResource,
  FunctionResource,
} from "../../_resources/tsCompilerAPIResources";
import { TSFunctionAnalyzer } from "./TSFunctionAnalyzer.class";
import { TSClassAnalyzer } from "./TSClassAnalyzer.class";
import { getTSFiles } from "../fileService/fileService";

export async function getAlltsClasses(): Promise<ClassResource[]> {
  const classResArr: ClassResource[] = [];

  const tsFiles = await getTSFiles();

  for (let file of tsFiles) {
    //Erstelle ClassResources
    const tsClasses = new TSClassAnalyzer(file);
    classResArr.push(...tsClasses.parse());
  }
  return classResArr;
}

export async function getAlltsFunctions(): Promise<FunctionResource[]> {
  const funcResArr: FunctionResource[] = [];

  const tsFiles = await getTSFiles();

  for (let file of tsFiles) {
    const tsfunctions = new TSFunctionAnalyzer(file);
    funcResArr.push(...tsfunctions.parse());
  }
  return funcResArr;
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
