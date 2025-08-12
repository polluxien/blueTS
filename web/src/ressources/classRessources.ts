import type { Path } from "react-router-dom";

export type TsFileResource = {
  name: string;
  path: Path;
};

export type TypeRessource = {
  typeAsString: string;
  paramType:
    | "basic"
    | "union"
    | "object"
    | "array"
    | "tuple"
    | "enum"
    | "literal"
    | "function"
    | "instance"
    | "any"
    | "null"
    | "undefined"
    | "never"
    | "void"
    | "unknown";
  enumValues?: string[];
  tupleElements?: TypeRessource[];
  unionValues?: TypeRessource[];
  arrayType?: TypeRessource;
  literalValue?: string | number | boolean | undefined;
  objectParameters?: ParameterRessource[];
};

export type ParameterRessource = {
  paramName: string;
  typeInfo: TypeRessource;
  optional: boolean;
};

export type ConstructorRessource = {
  parameters: ParameterRessource[];
  returnType?: string;
};

export type MethodRessource = {
  methodName: string;
  parameters: ParameterRessource[];
  specs: {
    methodKind: "default" | "get" | "set";
    visibility: "public" | "private" | "protected";
    isStatic: boolean;
    isAbstract: boolean;
    isAsync: boolean;
  };
  returnType: string;
};

export type ClassRessource = {
  className: string;
  tsFile: TsFileResource;
  constructors: ConstructorRessource[];
  methods: MethodRessource[];
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
  props?: PropInstanceType[];
  methods: MethodRessource[];
};

export type InstanceCheckRessource = {
  instanceName: string;
  isValid: boolean;
  props: PropInstanceType[];
  error: unknown;
};

//method types
export type RunMethodeInInstanceType = {
  instanceName: string;
  methodName: string;
  params: unknown[];
  specs: {
    methodKind: "default" | "get" | "set";
    isAsync: boolean;
  };
};

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
