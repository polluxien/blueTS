import { TsFileResource } from "../fileService/fileResources";

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