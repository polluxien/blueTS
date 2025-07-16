import type { Path } from "react-router-dom";

export type TsFileResource = {
  name: string;
  path: Path;
};

export type ParameterRessource = {
  name: string;
  type: string;
  optional: boolean;
};



export type ConstructorRessource = {
  parameters: ParameterRessource[] | undefined;
  returnType: string;
};

export type ClassRessource = {
  className: string;
  tsFile: TsFileResource;
  constructor: ConstructorRessource | undefined;
};