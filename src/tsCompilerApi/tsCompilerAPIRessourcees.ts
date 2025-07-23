import { Type } from "ts-morph";
import { TsFileResource } from "./fileService/fileResources";

export type ParameterRessource = {
  paramName: string;
  type: Type;
  typeAsString: string;
  optional: boolean;
};

export type ConstructorRessource = {
  parameters: ParameterRessource[] | undefined;
  returnType?: string;
};

export type MethodRessource = {
  methodName: string;
  parameters: ParameterRessource[] | undefined;
  returnType: string;
  isStatic: boolean;
};

export type ClassRessource = {
  className: string;
  tsFile: TsFileResource;
  constructors: ConstructorRessource[] | undefined;
  methodes: MethodRessource[] | undefined;
};

