import { TsFileResource } from "../fileService/fileResources";
import { ParameterRessource } from "../tsCompilerApi/tsCompilerAPIRessourcees";

export type CreateClassInstanceRessource = {
  instanceName: string;
  className: string;
  tsFile: TsFileResource;
  constructorParameter: any[];
};

export type ClassInstanceConstructionFunctionRessource = {
  functionName: string;
  parameter: ParameterRessource;
};

export type ClassInstanceConstructionRessource = {
  className: string;
  instanceName: string;
  function: ClassInstanceConstructionFunctionRessource[];
};

export type InstanceCheckRessource = {
  instanceName: string;
  isValid: boolean;
  error: unknown;
};