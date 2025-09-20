import type { ParameterResource } from "../ressources/classRessources";
import type { ValidationTypeResource } from "../ressources/frontend/paramResources";
import { validateFormControllType } from "./validateType";

export function validateSubmit(
  params: ParameterResource[],
  paramValidations: Record<string, ValidationTypeResource>,
  formValues: Record<string, string>
): {
  newErrors: Record<string, Error>;
  newParsedValues: Record<string, unknown>;
} {
  const newErrors: Record<string, Error> = {};
  const newParsedValues: Record<string, unknown> = {};

  for (const param of params) {
    const validation = paramValidations[param.paramName];

    if (!validation || !validation.isValid) {
      // Fallback
      if (!validation) {
        const value = formValues[param.paramName];
        const { err, parsedValue } = validateFormControllType(param, value);

        if (err) {
          newErrors[param.paramName] = err;
        } else {
          newParsedValues[param.paramName] = parsedValue;
        }
      } else {
        // verwende gesammelte Validierungsfehler
        if (validation.errors.length > 0) {
          newErrors[param.paramName] = validation.errors[0];
        }
      }
    } else {
      // verwende den parsedValue
      newParsedValues[param.paramName] = validation.parsedValue;
    }
  }
  return { newErrors, newParsedValues };
}
