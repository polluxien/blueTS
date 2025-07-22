import ts, { Path } from "typescript";
import * as vscode from "vscode";
import { getAllTsFilesFromDirectory } from "./fileService/fileService";
import { TSClassAnalyzer } from "../tsCompilerApi/tsClassAnalyzer.class";
import { ClassRessource } from "./tsCompilerAPIRessourcees";

export async function getAllClasses(path?: Path): Promise<ClassRessource[]> {
  //benutzte aktuellen Workspace oder ausgewählten Workspace
  let currentWorkspace = !path
    ? vscode.workspace.workspaceFolders?.[0].uri.fsPath
    : path;

  //bekomme alle TS-Files von ausgewählter Ordnerstrucktur
  const scrFiles = await getAllTsFilesFromDirectory(currentWorkspace!);

  //Finde alle TS-KLassen
  const tsClasses = new TSClassAnalyzer(scrFiles, {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  });

  //Erstelle ClassRessource
  return tsClasses.parse();
}
