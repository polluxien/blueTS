import type {
  ClassResource,
  FunctionResource,
} from "../backend/tsCompilerAPIResources";
import type { TsCodeCheckResource } from "../classRessources";

export type RefreshedResponseType = {
  tsFilePath: string;
  tsFileCheck: TsCodeCheckResource;
  refreshedClasses: ClassResource[];
  refreshedFunctions: FunctionResource[];
};
