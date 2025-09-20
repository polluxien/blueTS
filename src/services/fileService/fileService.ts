import fs from "fs";
import path from "path";
import { Path } from "typescript";
import { TsFileResource } from "../../_resources/FileResources";
import { getWorkspace } from "../workspaceService";

import * as vscode from "vscode";

let tsFilesArr: TsFileResource[] | null;

//exclude Pattern -> sollen ignoriert werden
// * eventuell noch erweitern
const DIRECTORY_EXCLUDE = [
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
const TEST_FILE_EXCLUDE = [
  ".test.ts",
  ".spec.ts",
  ".d.ts",
  ".stories.ts",
  ".stories.tsx",
  ".mock.ts",
  ".fixture.ts",
  ".e2e.ts",
];

function exludeFusionForVSCode() {
  const folderExcludes = DIRECTORY_EXCLUDE.map((ex) => `**/${ex}/**`);
  const testFileExcludes = TEST_FILE_EXCLUDE.map((ex) => `**/*${ex}`);
  const allExcludes = [...folderExcludes, ...testFileExcludes];

  return `{${allExcludes.join(",")}}`;
}

//wenn refresh true, durchsuche neu (bei Pfadänderung)
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

export async function getTsFilesCount(): Promise<number> {
  const files = await getTSFiles(false);
  return files.length;
}

export function resetTsFilesCache(): void {
  tsFilesArr = null;
}

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
      if (DIRECTORY_EXCLUDE.includes(entryName)) {
        continue;
      }

      const fullPath = path.join(dirPath, entryName);
      if (entry.isDirectory()) {
        const subfiles = await getAllTsFilesFromDirectory(fullPath);
        tsFileArr.push(...subfiles);
      } else if (entry.isFile() && entryName.endsWith(".ts")) {
        //überspringe Testdatein
        const isTestFile = TEST_FILE_EXCLUDE.some((end) =>
          entryName.endsWith(end)
        );
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
export async function hasTsFilesInDirectory(): Promise<boolean> {
  const workspace = getWorkspace();
  if (!workspace) {
    return false;
  }

  try {
    const tsFiles = await vscode.workspace.findFiles(
      // ? suche
      "**/*.{ts,tsx}",
      // ? schließe aus
      exludeFusionForVSCode(),
      // ? brauche nur 1 datei
      1
    );

    return tsFiles.length !== 0;
  } catch (err) {
    console.error(`Fehler beim Lesen von `, err);
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
