import fs from "fs";
import path from "path";
import { Path } from "typescript";
import { TsFileResource } from "../_resources/fileResources";
import { getWorkspace } from "../workspaceService";

let tsFilesArr: TsFileResource[];

export async function getTSFiles() {
  //bekomme alle TS-Files von ausgewählter Ordnerstrucktur
  if (!tsFilesArr) {
    tsFilesArr = await getAllTsFilesFromDirectory(getWorkspace());
  }
  return tsFilesArr;
}

export async function refreshTSFiles(newWorkspace: string) {
  //bekomme alle TS-Files von ausgewählter Ordnerstrucktur
  tsFilesArr = await getAllTsFilesFromDirectory(getWorkspace());
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
