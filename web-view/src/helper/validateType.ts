import type {
  ParameterResource,
  TypeResource,
} from "../ressources/classRessources";

export type ValidationResult = {
  err?: Error;
  parsedValue?: unknown;
};

type InstanceParamType = {
  className: string;
  instanceName: string;
};

export function validateFormControllType(
  paramRes: ParameterResource,
  formValue: string
): ValidationResult {
  const typeRes: TypeResource = paramRes.typeInfo;

  console.log("VALUE TO VALIDATE: ", formValue);
  console.log("NAME: ", typeRes.typeAsString);

  //wenn field garnicht benutzt aber required return sofort
  if (!formValue && !paramRes.isOptional) {
    return { err: new Error(`field is required`) };
  }

  //wenn nichts gegeben aber nicht gefordert return undefined || speziel undefined angegebn bei optional
  if ((paramRes.isOptional && !formValue) || formValue === "undefined") {
    return { parsedValue: undefined };
  }

  //basic types oder literalType defined
  if (typeRes.paramType === "basic" || typeRes.literalType) {
    if (typeRes.typeAsString === "string" || typeRes.literalType === "string") {
      if (
        formValue.length >= 2 &&
        ((formValue.startsWith('"') && formValue.endsWith('"')) ||
          (formValue.startsWith("`") && formValue.endsWith("`")) ||
          (formValue.startsWith("'") && formValue.endsWith("'")))
      ) {
        const stripped = formValue.slice(1, -1);
        return { parsedValue: stripped };
      }
      return { err: new Error('Invalid string "..."') };
    }
    if (
      typeRes.typeAsString === "boolean" ||
      typeRes.literalType === "boolean"
    ) {
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
    if (typeRes.typeAsString === "number" || typeRes.literalType === "number") {
      const num = Number(formValue);
      if (!isNaN(num)) {
        return { parsedValue: num };
      }
      return { err: new Error("Invalid number") };
    }
    if (typeRes.typeAsString === "bigint" || typeRes.literalType === "bigint") {
      try {
        const bigNum = BigInt(formValue);
        return { parsedValue: bigNum };
      } catch {
        return { err: new Error("Invalid bigint") };
      }
    }
  }

  // ! das mit dem enum funktioniert noch nicht, ich übergebe noch kein object
  //enum type
  if (typeRes.paramType === "enum") {
    return {
      parsedValue: {
        enumValue: `${typeRes.typeAsString}.${formValue}`,
        enumMembers: typeRes.enumMembers
      },
    };
  }

  // für object als type  (exampleObj: object)
  if (typeRes.typeAsString === "object") {
    try {
      const parsed = JSON.parse(formValue);

      if (parsed !== null && typeof parsed === "object") {
        return { parsedValue: parsed };
      } else {
        return { err: new Error("Invalid object") };
      }
    } catch {
      return { err: new Error("Invalid JSON-Struct for object") };
    }
  }

  if (typeRes.paramType === "function") {
    try {
      // ? Warscheinlich Nicht ganz sicher
      const fn = new Function(formValue);

      if (typeof fn === "function") {
        return { parsedValue: fn };
      }
    } catch {
      return { err: new Error("Invalid function") };
    }
  }

  if (typeRes.paramType === "instance") {
    try {
      // ! erst einaml keine validierung da aus vorgegebenr auswahl, vlt noch anpassen
      return {
        parsedValue: {
          className: typeRes.typeAsString,
          instanceName: formValue,
        } as InstanceParamType,
      };
    } catch {
      return { err: new Error("Invalid instance") };
    }
  }

  //akteptiere alles
  if (
    typeRes.paramType === "any" ||
    typeRes.paramType === "unknown" ||
    typeRes.typeAsString === "emptyObjectType"
  ) {
    return parseDynamicValue(formValue);
  }

  //void einziger akzepierter typ undefined deswegen überge -> keine auswahl erlaubt
  if (typeRes.paramType === "void") {
    return { parsedValue: undefined };
  }

  if (typeRes.paramType === "null") {
    return { parsedValue: null };
  }

  //never kann niemal vorkommen -> keine auswahl erlaubt -> übergebe nur err
  if (typeRes.paramType === "never") {
    return { err: new Error("never can't be used !") };
  }

  return { parsedValue: formValue };
}

function parseDynamicValue(formValue: string): ValidationResult {
  const trimmed = formValue.trim();
  let result: unknown;

  // Prüfe boolean
  if (trimmed.toLowerCase() === "true") result = true;
  if (trimmed.toLowerCase() === "false") result = false;

  // Prüfe number
  const num = Number(trimmed);
  if (!isNaN(num)) result = num;

  // Prüfe JSON Objekt / Array
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    try {
      result = JSON.parse(trimmed);
    } catch {
      return { err: new Error("Invalid JSON-Struct for object or array") };
    }
  }

  // Prüfe string
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
      (trimmed.startsWith("`") && trimmed.endsWith("`")))
  ) {
    result = trimmed.slice(1, -1);
  }
  if (!result) {
    return { err: new Error("no suitable type") };
  }
  return {};
}
