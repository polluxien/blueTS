import { TsFileResource } from "./FileResources";
import { ParameterResource } from "./tsCompilerAPIResources";

export type ClassInstanceConstructionFunctionRessource = {
  functionName: string;
  parameter: ParameterResource;
};

export type ClassInstanceConstructionRessource = {
  className: string;
  instanceName: string;
  function: ClassInstanceConstructionFunctionRessource[];
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

export type SpecailLockedType = {
  specialLockedType: "undefined" | "null";
};

export type GenericType = {
  genericType: "map" | "set" | "promise";
  values: unknown[];
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

//type für interene props von Instanz
export type CompiledPropInstanceType = {
  name: string;
  type: string;
  value?: string;
};
