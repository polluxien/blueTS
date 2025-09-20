import type { TsFileResource } from "../backend/FileResources";
import type { FunctionResource } from "../backend/tsCompilerAPIResources";

export type CompiledFunctionResponseTyp = {
  functionName: string;
  isValid: boolean;
  returnValue?: string;
  error?: Error;
  //unique über functionName + tsFile.path
  tsFile: TsFileResource;
};

//wenn file aktualisierung angefordeert wird
export type RefreshFunctionsRespondeType = {
  filePath: string;
  funcRes: FunctionResource[];
};
