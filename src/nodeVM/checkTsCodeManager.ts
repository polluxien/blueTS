import { TsFileResource } from "../_resources/fileResources";
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
  errors: string[];
};

export async function addFilesToTestedFilesMap(tsFiles: TsFileResource[]) {
  const myFileSet = filterFiles(tsFiles);

  myFileSet.forEach(async (filePath) => {
    const result = await checkTsCode(filePath);
    myTestedFileMap.set(filePath, result);
  });

  console.log("myTested FileMap: ", myTestedFileMap);
  return myTestedFileMap;
}

export async function dropFilesFromTestedFileMap(tsFiles: TsFileResource[]) {
  const myFileSet = filterFiles(tsFiles);

  for (let filePath of myFileSet) {
    myTestedFileMap.delete(filePath);
  }
  return myTestedFileMap;
}
