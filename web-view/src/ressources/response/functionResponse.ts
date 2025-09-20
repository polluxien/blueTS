import type { TsFileResource } from "../classRessources";

export type CompiledFunctionResponseTyp = {
  functionName: string;
  isValid: boolean;
  returnValue?: string;
  error?: Error;
  //unique über functionName + tsFile.path
  tsFile: TsFileResource;
};