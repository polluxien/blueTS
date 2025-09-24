import type { TsFileResource } from "./FileResources";

// * Param-Resource Types für Object- als auch Function-View

export type GenericParamTypeResource = {
  baseType: string;
  genericArgs?: TypeResource[];
};

export type TypeResource = {
  typeAsString: string;
  paramType: // ? string, number, boolean, BigInt
  | "primitive-basic"
    // ? unknown, symbol
    | "primitive-special"
    // ? any, undefined
    | "special"
    // ? null, void, never,
    | "special-locked"
    // ? fallback -> max depth, recursiv reference, type not found, analyze error
    | "fallback"
    | "enum"
    | "array"
    | "union"
    | "intersection"
    | "object"
    | "tuple"
    | "literal"
    | "function"
    | "instance"
    | "generic";
  isOptional?: boolean;
  isRest?: boolean;
  errorWarning?: string;
  // * typeSpecific
  literalType?: string;
  enumMembers?: string[];
  intersectionValues?: TypeResource[];
  tupleElements?: TypeResource[];
  unionValues?: TypeResource[];
  arrayType?: TypeResource;
  objectParameters?: ParameterResource[];
  //* sehr Spezielle Typen
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
