import { TsFileResource } from "../FileResources";

//function Types
export type RunFunctionRequestType = {
  functionName: string;
  params: unknown[];
  specs: {
    isAsync: boolean;
  };
  tsFile: TsFileResource;
};
