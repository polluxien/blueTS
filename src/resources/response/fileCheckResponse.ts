import { TsCodeCheckResource } from "../../../src/services/nodeVM/checkTsCodeManager";
import { ClassResource, FunctionResource } from "../src/tsCompilerAPIResources";

export type RefreshedResponseType = {
  tsFilePath: string;
  tsFileCheck: TsCodeCheckResource;
  refreshedClasses: ClassResource[];
  refreshedFunctions: FunctionResource[];
};
