import { TsFileResource } from "../../_resources/fileResources";
import { getTSFiles } from "../fileService/fileService";
import { checkTsCode } from "./nodeVMService";

const myTestedFileMap = new Map<string, TsCodeCheckResource>([]);

//nach dopplungen filter
function filterFiles(tsFiles: TsFileResource[]) {
  const myFileSet = new Set<string>();
  tsFiles.forEach((file) => myFileSet.add(file.path));
  return myFileSet;
}

export type TsCodeCheckResource = {
  isValid: boolean;
  errors: CompileErrorResource[];
};

export type CompileErrorResource = {
  message: string;
  col: number | undefined;
  row: number | undefined;
};

export async function addAllFilesToTestedFilesMap() {
  const myFileSet = filterFiles(await getTSFiles());

  for (const filePath of myFileSet) {
    const result = await checkTsCode(filePath);
    myTestedFileMap.set(filePath, result);
  }

  /*
  console.log("myTested FileMap:");
  for (const [key, value] of myTestedFileMap.entries()) {
    console.log(key, JSON.stringify(value));
  }
  */

  return Array.from(myTestedFileMap.entries());
}

export async function addFilesToTestedFilesMap(tsFilePath: string) {
  const result = await checkTsCode(tsFilePath);
  myTestedFileMap.set(tsFilePath, result);

  return Array.from(myTestedFileMap.entries());
}

export async function dropFilesFromTestedFileMap(tsFiles: TsFileResource) {
  myTestedFileMap.delete(tsFiles.path);

  return Array.from(myTestedFileMap.entries());
}
