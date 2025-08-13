import { Path } from "typescript";

export type TsFileResource = {
  name: string;
  path: string;
};

export type DirectoryResource = {
  name: string;
  path: string;
  tsFiles: TsFileResource[];
  directorys: DirectoryResource[];
};
