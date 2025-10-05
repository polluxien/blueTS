import {
  ClassResource,
  FunctionResource,
} from "../../_resources/tsCompilerAPIResources";
import { TSFunctionAnalyzer } from "./TSFunctionAnalyzer.class";
import { TSClassAnalyzer } from "./TSClassAnalyzer.class";
import { getTSFiles } from "../fileService/fileService";
import { TsFileResource } from "../../_resources/FileResources";

/**
 * Analysiert alle TS-Dateien im Projekt und extrahiert Klassen-MetaDaten
 */
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

/**
 * Analysiert alle TS-Dateien im Projekt und extrahiert Function-MetaDaten
 */
export async function getAlltsFunctions(): Promise<FunctionResource[]> {
  const funcResArr: FunctionResource[] = [];

  const tsFiles = await getTSFiles();

  for (let file of tsFiles) {
    const tsfunctions = new TSFunctionAnalyzer(file);
    funcResArr.push(...tsfunctions.parse());
  }
  return funcResArr;
}

/**
 * Analysiert spezifische TS-Datei im Projekt und extrahiert Klassen-MetaDaten
 */
export async function getFileSpeficClasses(
  tsFile: TsFileResource
): Promise<ClassResource[]> {
  //Erstelle ClasenRessources
  const tsClasses = new TSClassAnalyzer(tsFile);
  return tsClasses.parse();
}

/**
 * Analysiert spezifische TS-Datei im Projekt und extrahiert Funktions-MetaDaten
 */
export async function getFileSpeficFunctions(
  tsFile: TsFileResource
): Promise<FunctionResource[]> {
  //Erstelle ClasenRessources
  const tsFunctions = new TSFunctionAnalyzer(tsFile);
  return tsFunctions.parse();
}
