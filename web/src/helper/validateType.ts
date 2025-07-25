import type {
  ParameterRessource,
  TypeRessource,
} from "../ressources/classRessources";

export type ValidationResult = {
  err?: Error;
  parsedValue?: unknown;
};

export function validateFormControllType(
  paramRes: ParameterRessource,
  formValue: string
): ValidationResult {
  const typeRes: TypeRessource = paramRes.typeInfo;

  //wenn field garnicht benutzt aber required return sofort
  if (!formValue && !paramRes.optional) {
    return { err: new Error(`field is required`) };
  }

  //wenn nichts gegeben aber nicht gefordert return undefined
  if (!formValue && paramRes.optional) {
    return { parsedValue: undefined };
  }

  //akteptiere alles
  if (typeRes.paramType === "any" || typeRes.paramType === "unknown") {
    return { parsedValue: formValue };
  }

  //basic types
  if (typeRes.paramType === "basic") {
    if (typeRes.typeAsString === "string") {
      if (formValue.startsWith('"') && formValue.endsWith('"')) {
        const stripped = formValue.slice(1, -1);
        return { parsedValue: stripped };
      }
      return { err: new Error('Invalid string "..."') };
    }
    if (typeRes.typeAsString === "boolean") {
      const bool = formValue.toLowerCase();
      if (bool == "true" || bool == "false") {
        //gebe typ true oder false zurück
        return {
          parsedValue: bool === "true",
        };
      }
      return {
        err: new Error("Invalid boolean"),
      };
    }
    if (typeRes.typeAsString === "number") {
      const num = Number(formValue);
      if (!isNaN(num)) {
        return { parsedValue: num };
      }
      return { err: new Error("Invalid number") };
    }
  }

  //enum type
  if (typeRes.paramType === "enum") {
    if (typeRes.enumValues?.includes(formValue)) {
      return { parsedValue: formValue };
    } else {
      return { err: new Error(`Invalid enum`) };
    }
  }

  //
  if (typeRes.paramType === "array") {
    if (typeRes.enumValues?.includes(formValue)) {
      return { parsedValue: formValue };
    } else {
      return { err: new Error(`Invalid enum`) };
    }
  }

  return { parsedValue: formValue };
}
