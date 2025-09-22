export type TsFileResource = {
  name: string;
  path: string;
};

// * Param-Resource Types für Object- als auch Function-View






export type InstanceCheckResource = {
  instanceName: string;
  isValid: boolean;
  props: PropInstanceType[];
  error: unknown;
};

//function Types
export type RunFunctionType = {
  functionName: string;
  params: unknown[];
  specs: {
    isAsync: boolean;
  };
  tsFile: TsFileResource;
};

//method types
export type RunMethodeInInstanceType = {
  instanceName: string;
  methodName: string;
  params: unknown[];
  specs: {
    methodKind: "default" | "get" | "set";
    isAsync: boolean;
  };
};

export type CompiledMethodInInstanceTyp = {
  instanceName: string;
  methodName: string;
  //unique über instanceName + methodeName + methodKind
  methodKind: "default" | "get" | "set";
  newProps?: PropInstanceType[];
  isValid: boolean;
  returnValue?: string;
  error?: Error;
};

export type CompiledFunctionTyp = {
  functionName: string;
  isValid: boolean;
  returnValue?: string;
  error?: Error;
  //unique über functionName + tsFile.path
  tsFile: TsFileResource;
};

//type für interene props von Instanz
export type PropInstanceType = {
  name: string;
  type: string;
  value?: string;
  specs?: {
    visibility: "public" | "private" | "protected";
    isStatic: boolean;
  };
};
////////// -------

export type TsCodeCheckResource = {
  isValid: boolean;
  errors: CompileErrorResource[];
};

export type CompileErrorResource = {
  message: string;
  col: number | undefined;
  row: number | undefined;
};
