import { Path } from "typescript";


export type TsFileResource = {
  name: string;
  path: Path;
};

export type DirectoryResource = {
  name: string;
  path: Path;
  tsFiles: TsFileResource[];
  directorys: DirectoryResource[];
};
