import { TsFileResource } from "./fileService/fileResources";

export type ParameterRessource = {
  paramName: string;
  typeAsString: string;
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