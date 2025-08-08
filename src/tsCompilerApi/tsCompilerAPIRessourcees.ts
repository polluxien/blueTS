import { TsFileResource } from "../fileService/fileResources";

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
  literalValue?: string | number | undefined;
  objectParameters?: ParameterRessource[];
  //ich galube erst mal ein bisschen lighter mit namer nur ohne 1 zu 1 prüfen ob identisch
  // ! selbst damit könnte ich nicht feststellen ob 1 zu 1 identisch
  //instanceClass?: ClassRessource;
};

export type ParameterRessource = {
  paramName: string;
  typeInfo: TypeRessource;
  optional: boolean;
};

export type ConstructorRessource = {
  parameters: ParameterRessource[];
  //returnType wird aktuell nicht benutzt
  //returnType?: string;
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
