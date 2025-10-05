import { TsFileResource } from "../../_resources/FileResources";
import { getTSFiles } from "../fileService/fileService";
import { checkTsCode } from "./nodeVMService";
import { TsCodeCheckResource } from "../../_resources/nodeVMResources";

// hier werden alle Filenmamen mit entsprechnden Syntax-Validierungen hinterlegt
// ? Map<fileName, TsCodeCheckResource>
const myTestedFileMap = new Map<string, TsCodeCheckResource>([]);

/**
 * wird genutzt um dopplungen herauszufiltern aus den Files und nur die Filenamen zu extrahieren
 * 
 * @param tsFiles 
 * @returns Set<string>
 */
function filterFiles(tsFiles: TsFileResource[]) {
  const myFileSet = new Set<string>();
  tsFiles.forEach((file) => myFileSet.add(file.path));
  return myFileSet;
}

/**
 * Lädt alle TS-Dateien, prüft Syntax und fügt zur Map hinzu.
 * Gibt Tupel-Array zurück, da Maps nicht serialisierbar sind.
 */
export async function addAllFilesToTestedFilesMap(): Promise<
  [string, TsCodeCheckResource][]
> {
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

  // * ich kann den Datentype Map nicht verschicken --> tupelArray
  return Array.from(myTestedFileMap.entries());
}

/**
 * Fügt einzelne Datei zur Map hinzu (wird bei File-Änderungen manuell vom Frontend abgefragt)
 */
export async function addFilesToTestedFilesMap(
  tsFileRes: TsFileResource
): Promise<TsCodeCheckResource> {
  const result = await checkTsCode(tsFileRes.path);
  myTestedFileMap.set(tsFileRes.path, result);

  console.log("myTested FileMap:");
  for (const [key, value] of myTestedFileMap.entries()) {
    console.log(key, JSON.stringify(value));
  }

  return result;
}

/**
 * Entfernt Datei aus Map wird bei Dateiänderung abgerufen
 */
export function dropFilesFromTestedFileMap(filepath: string): boolean {
  if (!myTestedFileMap.get(filepath)) {
    return false;
  }

  myTestedFileMap.delete(filepath);
  return true;
}
