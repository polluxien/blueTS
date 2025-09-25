import type { TsFileResource } from "../backend/FileResources";
import type { FunctionResource } from "../backend/tsCompilerAPIResources";

export type CompiledFunctionResponseTyp = {
  //unique über functionName + tsFile.path
  functionName: string;
  tsFile: TsFileResource;
  isValid: boolean;
  returnValue?: string;
  error?: Error;
  logs?: string[];
};

//wenn file aktualisierung angefordeert wird
export type RefreshFunctionsRespondeType = {
  filePath: string;
  funcRes: FunctionResource[];
};
