export type ValidationResult = {
  err?: Error;
  parsedValue?: unknown;
};

export type InstanceParamType = {
  className: string;
  instanceName: string;
};