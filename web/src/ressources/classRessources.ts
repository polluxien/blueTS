import type { Path } from "react-router-dom";
import type { Type } from "typescript";

export type TsFileResource = {
  name: string;
  path: Path;
};

export type ParameterRessource = {
  name: string;
  type: Type;
  typeAsString: string;
  optional: boolean;
};

export type ConstructorRessource = {
  parameters: ParameterRessource[] | undefined;
  returnType: string;
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
  constructor: ConstructorRessource | undefined;
  methodes: MethodRessource[];
};

//Zum versenden zur Extension
export type CreateClassInstanceRessource = {
  instanceName: string;
  className: string;
  tsFile: TsFileResource;
  constructorParameter: unknown[];
};

export type InstanceRessource = {
  instanceName: string;
  className: string;
  methodes: MethodRessource[];
};

export type InstanceCheckRessource = {
  instanceName: string;
  isValid: boolean;
  error: unknown;
};
