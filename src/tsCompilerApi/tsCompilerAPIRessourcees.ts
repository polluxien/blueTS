import { PseudoBigInt } from "typescript";
import { TsFileResource } from "./fileService/fileResources";

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
    | "tupel"
    | "function"
    | "any"
    | "never"
    | "void"
    | "unknown";
  enumValues?: string[];
  tupleElements?: TypeRessource[];
  unionValues?: TypeRessource[];
  arrayType?: TypeRessource;
  literalValue?: string | number | undefined;
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
  returnType: string;
  isStatic: boolean;
};

export type ClassRessource = {
  className: string;
  tsFile: TsFileResource;
  constructors: ConstructorRessource[];
  methods: MethodRessource[];
};
