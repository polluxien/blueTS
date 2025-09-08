import { PseudoBigInt } from "typescript";
import { TsFileResource } from "./fileResources";

// * Param-Resource Types für Object- als auch Function-View

export type FunctionParamTypeSignatureResource = {
  defaultImplementation: string;
  returnType?: TypeResource;
};

export type GenericParamTypeResource = {
  baseType: string;
  genericArgs?: TypeResource[];
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
    | "unknown"
    | "intersection"
    | "generic"
    | "max-depth"
    | "recursive-reference";
  isOptional?: boolean;
  isRest?: boolean;
  // * typeSpecific
  literalType?: string;
  enumMembers?: string[];
  intersectionValues?: TypeResource[];
  tupleElements?: TypeResource[];
  unionValues?: TypeResource[];
  arrayType?: TypeResource;
  objectParameters?: ParameterResource[];
  //* sehr Spezielle Typen
  functionRes?: FunctionParamTypeSignatureResource;
  genericRes?: GenericParamTypeResource;
};

export type ParameterResource = {
  paramName: string;
  typeInfo: TypeResource;
  isOptional: boolean;
  isRest?: boolean;
};

// * Class-Resource Types für Object View

export type ConstructorResource = {
  parameters: ParameterResource[];
  //returnType wird aktuell nicht benutzt
  //returnType?: string;
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
  constructor: ConstructorResource | undefined;
  methods: MethodResource[];
};

// * Function-Resource Types für Function-View

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
