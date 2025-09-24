import { TsFileResource } from "../../FileResources";

//Zum versenden zur Extension
export type CreateClassInstanceRequestType = {
  className: string;
  instanceName: string;
  params: unknown[];
  tsFile: TsFileResource;
};

//method types
export type RunMethodInInstanceRequestType = {
  instanceName: string;
  methodName: string;
  params: unknown[];
  specs: {
    methodKind: "default" | "get" | "set";
    isAsync: boolean;
  };
};
