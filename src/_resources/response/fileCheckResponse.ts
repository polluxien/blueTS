import { TsCodeCheckResource } from "../nodeVMResources";
import { ClassResource, FunctionResource } from "../tsCompilerAPIResources";

export type RefreshedResponseType = {
  tsFilePath: string;
  tsFileCheck: TsCodeCheckResource;
  refreshedClasses: ClassResource[];
  refreshedFunctions: FunctionResource[];
};
