import { TsFileResource } from "./fileResources";
import { ParameterResource } from "./tsCompilerAPIResources";

export type CreateClassInstanceRessource = {
  instanceName: string;
  className: string;
  tsFile: TsFileResource;
  constructorParameter: unknown[];
};

export type ClassInstanceConstructionFunctionRessource = {
  functionName: string;
  parameter: ParameterResource;
};

export type ClassInstanceConstructionRessource = {
  className: string;
  instanceName: string;
  function: ClassInstanceConstructionFunctionRessource[];
};

export type InstanceCheckRessource = {
  instanceName: string;
  isValid: boolean;
  props: PropInstanceType[];
  error: unknown;
};

//vom Frontend wenn instanz übergeben werden soll
export type InstanceParamType = {
  className: string;
  instanceName: string;
};

//übergabe vom Frontend
export type RunMethodeInInstanceType = {
  instanceName: string;
  methodName: string;
  params: unknown[];
  specs: {
    methodKind: "default" | "get" | "set";
    isAsync: boolean;
  };
};

//zurückgabe nach compilieren an Frontend
export type CompiledRunMethodInInstanceTyp = {
  instanceName: string;
  methodName: string;
  methodKind: "default" | "get" | "set";
  newProps?: PropInstanceType[];
  isValid: boolean;
  returnValue?: string;
  error?: Error;
};

//type für interene props von Instanz
export type PropInstanceType = {
  name: string;
  type: string;
  value?: string;
  specs?: {
    visibility: "public" | "private" | "protected";
    isStatic: boolean;
  };
};
