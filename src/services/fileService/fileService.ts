import fs from "fs";
import path from "path";
import { Path } from "typescript";
import { TsFileResource } from "../../_resources/fileResources";
import { getWorkspace } from "../workspaceService";

let tsFilesArr: TsFileResource[];

//wenn refresh true, durchsuche neu (bei Pfadänderung)
// ? sollte immer true sein da ich ja neue files erstellen kann und parallel meine extension habe
export async function getTSFiles(refresh = true): Promise<TsFileResource[]> {
  //bekomme alle TS-Files von ausgewählter Ordnerstrucktur
  if (!tsFilesArr || refresh) {
    const workspace = getWorkspace();
    if (!workspace) {
      throw new Error("kein workspace geöffnet");
    }
    tsFilesArr = await getAllTsFilesFromDirectory(workspace);

    console.log(
      "TSFILES GEFUNDEN UND ICON SOLLTE ANGEZEIGT WERDEN!: ",
      hasTsFilesInDirectory()
    );
  }
  return tsFilesArr;
}

// ! wirft eh nur solange ich das mit message handler nicht besser mache

/* 
export function getTSFilesLength(): number {
  if (!tsFilesArr) {
    throw new Error("ts files wurden noch nicht geladen");
  }
  return tsFilesArr.length;
}
  */

//exclude Pattern -> sollen ignoriert werden
// * eventuell noch erweitern
const excludePatterns = [
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".git",
  "logs",
  ".cache",
  ".vscode",
  "temp",
];
const testFileEx = [
  ".test.ts",
  ".spec.ts",
  ".d.ts",
  ".stories.ts",
  ".stories.tsx",
  ".mock.ts",
  ".fixture.ts",
  ".e2e.ts",
];

//rekursive rückgabe nach tsFiles mit rückgabe von Resourcen
async function getAllTsFilesFromDirectory(
  dirPath: string
): Promise<TsFileResource[]> {
  let tsFileArr: TsFileResource[] = [];

  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (let entry of entries) {
      const entryName = entry.name;
      //überspringe nicht relevante Ordnerstruckturen
      if (excludePatterns.includes(entryName)) {
        continue;
      }

      const fullPath = path.join(dirPath, entryName);
      if (entry.isDirectory()) {
        const subfiles = await getAllTsFilesFromDirectory(fullPath);
        tsFileArr.push(...subfiles);
      } else if (entry.isFile() && entryName.endsWith(".ts")) {
        //überspringe Testdatein
        const isTestFile = testFileEx.some((end) => entryName.endsWith(end));
        if (isTestFile) {
          continue;
        }

        tsFileArr.push({
          name: entry.name,
          path: fullPath as Path,
        });
      }
    }
  } catch (err) {
    console.error(`Fehler beim Lesen von ${dirPath}:`, err);
  }
  return tsFileArr;
}

//rekursive suche nach stimmigen TS-Files als boolean
export async function hasTsFilesInDirectory(
  dirPath = getWorkspace()
): Promise<boolean> {
  try {
    const entries = await fs.promises.readdir(dirPath, {
      withFileTypes: true,
    });

    for (let entry of entries) {
      const entryName = entry.name;
      if (excludePatterns.includes(entryName)) {
        continue;
      }

      const fullPath = path.join(dirPath, entryName);
      if (entry.isDirectory()) {
        const hasTS = await hasTsFilesInDirectory(fullPath);
        if (hasTS) {
          return true;
        }
      } else if (entry.isFile() && entryName.endsWith(".ts")) {
        const isTestFile = testFileEx.some((end) => entryName.endsWith(end));
        if (!isTestFile) {
          return true;
        }
      }
    }
  } catch (err) {
    console.error(`Fehler beim Lesen von ${dirPath}:`, err);
  }
  return false;
}

// ? erst einmal nicht benötigt
/*
async function getCurrentFileDirectory(
  dirPath: string
): Promise<DirectoryResource> {
  let curDirectory: DirectoryResource = {
    name: path.basename(dirPath),
    path: dirPath as Path,
    tsFiles: [],
    directorys: [],
  };

  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (let entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subDirectory = await getCurrentFileDirectory(fullPath);
        curDirectory.directorys.push(subDirectory);
      } else if (entry.isFile() && entry.name.endsWith(".ts")) {
        curDirectory.tsFiles.push({
          name: entry.name,
          path: fullPath as Path,
        });
      }
    }
  } catch (err) {
    console.error(
      `getCurrentFileDirectory: Fehler beim Lesen von ${dirPath}:`,
      err
    );
  }
  return curDirectory;
}

*/
