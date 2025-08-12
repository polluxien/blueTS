import { TsFileResource } from "./fileResources";

// * Param-Resource Types für Object- als auch Function-View

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
  literalValue?: string | number | undefined;
  objectParameters?: ParameterResource[];
  //ich galube erst mal ein bisschen lighter mit namer nur ohne 1 zu 1 prüfen ob identisch
  // ! selbst damit könnte ich nicht feststellen ob 1 zu 1 identisch
  //instanceClass?: ClassRessource;
};

export type ParameterResource = {
  paramName: string;
  typeInfo: TypeResource;
  optional: boolean;
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
  constructors: ConstructorResource[];
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
