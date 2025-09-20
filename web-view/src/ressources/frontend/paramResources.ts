import type { ParameterResource } from "../backend/tsCompilerAPIResources";

export type ParamFormTypeResource = {
  index: number;
  param: ParameterResource;
  formValue: string;
  validated: boolean;
  error?: Error;

  onChange: (paramName: string, value: string) => void;
  onValidationChange?: (
    paramName: string,
    validationRes: ValidationTypeResource
  ) => void;

  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;
  hideLabel?: boolean;
};

export type ValidationTypeResource = {
  isValid: boolean;
  errors: Error[];
  parsedValue?: unknown;
};
