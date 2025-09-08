export type TsFileResource = {
  name: string;
  path: string;
};

// * Param-Resource Types für Object- als auch Function-View

export type FunctionParamTypeSignatureResource = {
  defaultImplementation: string;
  returnType?: TypeResource;
};

export type GenericParamTypeResource = {
  baseType: string;
  genericArgs?: TypeResource[];
};

export type TypeResource = {
  typeAsString: string;
  paramType:
    | "basic"
    | "union"
    | "object"
    | "array"
    | "tuple"
    | "enum"
    | "literal"
    | "function"
    | "instance"
    | "any"
    | "null"
    | "undefined"
    | "never"
    | "void"
    | "unknown"
    | "intersection"
    | "generic"
    | "max-depth"
    | "recursive-reference";
  isOptional?: boolean;
  isRest?: boolean;
  // * typeSpecific
  literalType?: string;
  enumMembers?: string[];
  intersectionValues?: TypeResource[];
  tupleElements?: TypeResource[];
  unionValues?: TypeResource[];
  arrayType?: TypeResource;
  objectParameters?: ParameterResource[];
  //* sehr Spezielle Typen
  functionRes?: FunctionParamTypeSignatureResource;
  genericRes?: GenericParamTypeResource;
};

export type ParameterResource = {
  paramName: string;
  typeInfo: TypeResource;
  isOptional: boolean;
  isRest?: boolean;
};

export type ConstructorResource = {
  parameters: ParameterResource[];
  returnType?: string;
};

export type MethodResource = {
  methodName: string;
  parameters: ParameterResource[];
  specs: {
    methodKind: "default" | "get" | "set";
    visibility: "public" | "private" | "protected";
    isStatic: boolean;
    isAbstract: boolean;
    isAsync: boolean;
  };
  returnType: string;
};

export type ClassResource = {
  className: string;
  tsFile: TsFileResource;
  constructor: ConstructorResource | undefined;
  methods: MethodResource[];
};

//Zum versenden zur Extension
export type CreateClassInstanceResource = {
  instanceName: string;
  className: string;
  tsFile: TsFileResource;
  constructorParameter: unknown[];
};

export type InstanceResource = {
  instanceName: string;
  className: string;
  props?: PropInstanceType[];
  methods: MethodResource[];
};

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

export type FunctionResource = {
  functionName: string;
  tsFile: TsFileResource;
  parameters: ParameterResource[];
  specs: {
    isDefault: boolean;
    isExported: boolean;
    isAsync: boolean;
    //Keine ahnung wie ich das ermitteln soll
    //isDeclare: boolean;
    functionType:
      | "function-declaration"
      | "arrow-function"
      | "function-expression"
      | "generator-function";
  };
  returnType: string;
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
