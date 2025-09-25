import type { TsFileResource } from "./FileResources";
import type { ParameterResource } from "./tsCompilerAPIResources";

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
  props: CompiledPropInstanceType[];
  error: unknown;
};

//vom Frontend wenn instanz übergeben werden soll
export type InstanceParamType = {
  className: string;
  instanceName: string;
};

//vom Frontend wird Enum übergeben
export type EnumParamType = {
  enumValue: string;
  enumMembers: string[];
};


//checke ob der kompilierte code koreckt ist
export type verifyContext = {
  context: string;
  isValid: boolean;
  error?: Error;
};

//liefe alle props von instance zurück
export type InstancePropsType = {
  instanceName: string;
  classNAme: string;
  props: InstancePropType[];
};

export type InstancePropType = {
  name: string;
  type: string;
  value?: string;
  specs?: {
    visibility: "public" | "private" | "protected";
    isStatic: boolean;
  };
};

//vom Frontend wird rest übergeben

export type RestParamType = {
  restParams: unknown[];
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
  newProps?: CompiledPropInstanceType[];
  isValid: boolean;
  returnValue?: string;
  error?: Error;
};

//type für interene props von Instanz
export type CompiledPropInstanceType = {
  name: string;
  type: string;
  value?: string;
};
