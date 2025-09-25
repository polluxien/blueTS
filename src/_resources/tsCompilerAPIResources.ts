import { TsFileResource } from "./FileResources";

// * Param-Resource Types für Object- als auch Function-View

export type GenericParamTypeResource = {
  baseType: string;
  genericArgs: TypeResource[];
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

export type PropertyResource = {
  name: string;
  type: string;
  specs: {
    visibility: "public" | "private" | "protected";
    isStatic: boolean;
    isReadonly: boolean;
  };
};

// * Class-Resource Types für Object View

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
  constructorParams: ParameterResource[];
  methods: MethodResource[];
  properties: PropertyResource[];
  specs: {
    extendsClass: string | undefined;
    implementsInterfaces: string[];
  };
};

// * Function-Resource Types für Function-View

export type FunctionResource = {
  functionName: string;
  tsFile: TsFileResource;
  parameters: ParameterResource[];
  specs: {
    isDefault: boolean;
    isAsync: boolean;
    functionType:
      | "function-declaration"
      | "arrow-function"
      | "function-expression"
      | "generator-function";
  };
  returnType: string;
};
