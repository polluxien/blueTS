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

async function getAllTsFilesFromDirectory(
  dirPath: string
): Promise<TsFileResource[]> {
  let tsFileArr: TsFileResource[] = [];

  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (let entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subfiles = await getAllTsFilesFromDirectory(fullPath);
        tsFileArr.push(...subfiles);
      } else if (entry.isFile() && entry.name.endsWith(".ts")) {
        tsFileArr.push({
          name: entry.name,
          path: fullPath as Path,
        });
      }
    }
  } catch (err) {
    console.error(
      `getAllTsFilesFromDirectory: Fehler beim Lesen von ${dirPath}:`,
      err
    );
  }
  return tsFileArr;
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
