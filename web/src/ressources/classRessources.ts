import type { Path } from "react-router-dom";

export type TsFileResource = {
  name: string;
  path: Path;
};

export type TypeResource = {
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
  tupleElements?: TypeResource[];
  unionValues?: TypeResource[];
  arrayType?: TypeResource;
  literalValue?: string | number | boolean | undefined;
  objectParameters?: ParameterResource[];
};

export type ParameterResource = {
  paramName: string;
  typeInfo: TypeResource;
  optional: boolean;
};

export type ConstructorResource = {
  parameters: ParameterResource[];
  returnType?: string;
};

export type MethodResource = {
  methodName: string;
  parameters: ParameterResource[];
  specs: {
    methodKind: "default" | "get" | "set";
    visibility: "public" | "private" | "protected";
    isStatic: boolean;
    isAbstract: boolean;
    isAsync: boolean;
  };
  returnType: string;
};

export type ClassResource = {
  className: string;
  tsFile: TsFileResource;
  constructors: ConstructorResource[];
  methods: MethodResource[];
};

//Zum versenden zur Extension
export type CreateClassInstanceResource = {
  instanceName: string;
  className: string;
  tsFile: TsFileResource;
  constructorParameter: unknown[];
};

export type InstanceResource = {
  instanceName: string;
  className: string;
  props?: PropInstanceType[];
  methods: MethodResource[];
};

export type InstanceCheckResource = {
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

export type FunctionResource = {
  functionName: string;
  tsFile: TsFileResource;
  parameters: ParameterResource[];
  specs: {
    isDefault: boolean;
    isExported: boolean;
    isAsync: boolean;
    //Keine ahnung wie ich das ermitteln soll
    //isDeclare: boolean;
    functionType:
      | "function-declaration"
      | "arrow-function"
      | "function-expression"
      | "generator-function";
  };
  returnType: string;
};
