import type {
  ParameterResource,
  TypeResource,
} from "../ressources/backend/tsCompilerAPIResources";
import type {
  InstanceParamType,
  ValidationResult,
} from "./validateTypeResources";

export function validateFormControllType(
  paramRes: ParameterResource,
  formValue: string,
  isTopLevel: boolean
): ValidationResult {
  const typeRes: TypeResource = paramRes.typeInfo;

  console.info("VALUE TO VALIDATE: ", formValue);
  console.info("NAME: ", typeRes.typeAsString);

  //wenn field garnicht benutzt aber required return sofort
  if (!formValue && !paramRes.isOptional && !typeRes.isOptional) {
    return { err: new Error(`field is required`) };
  }

  //wenn nichts gegeben aber nicht gefordert return undefined || speziel undefined angegebn bei optional
  if (
    (!formValue && (paramRes.isOptional || typeRes.isOptional)) ||
    (formValue === "undefined" && typeRes.typeAsString === "undefined")
  ) {
    if (isTopLevel) return { parsedValue: { specialLockedType: "undefined" } };
    return { parsedValue: undefined };
  }

  //basic types oder literalType defined
  if (typeRes.paramType === "primitive-basic" || typeRes.literalType) {
    if (typeRes.typeAsString === "string" || typeRes.literalType === "string") {
      if (
        formValue.length >= 2 &&
        ((formValue.startsWith('"') && formValue.endsWith('"')) ||
          (formValue.startsWith("`") && formValue.endsWith("`")) ||
          (formValue.startsWith("'") && formValue.endsWith("'")))
      ) {
        if (formValue.length > 100) {
          return {
            err: new Error("string can't be longer than 100 characters"),
          };
        }
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

  //enum type
  if (typeRes.paramType === "enum") {
    return {
      parsedValue: {
        enumValue: `${typeRes.typeAsString}.${formValue}`,
        enumMembers: typeRes.enumMembers,
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
    typeRes.typeAsString === "any" ||
    typeRes.typeAsString === "unknown" ||
    typeRes.typeAsString === "emptyObjectType"
  ) {
    return parseDynamicValue(formValue);
  }

  // ! hier ist der knackpunkt - aber warum?
  //void einziger akzepierter typ undefined deswegen überge -> keine auswahl erlaubt
  if (typeRes.typeAsString === "void") {
    if (isTopLevel) return { parsedValue: { specialLockedType: "undefined" } };
    return { parsedValue: undefined };
  }

  if (typeRes.typeAsString === "null") {
    if (isTopLevel) return { parsedValue: { specialLockedType: "null" } };
    return { parsedValue: null };
  }

  //never kann niemals vorkommen -> keine auswahl erlaubt -> übergebe nur err
  if (typeRes.typeAsString === "never") {
    return { err: new Error("never can't be used !") };
  }

  if (typeRes.typeAsString === "symbol") {
    if (formValue.startsWith("Symbol(") && formValue.endsWith(")")) {
      const content = formValue.slice(7, -1); // "Symbol(" und ")" entfernen

      // Leer 
      if (content === "") {
        return { parsedValue: Symbol() };
      }

      // String literal - Symbol("text")
      if (
        (content.startsWith('"') && content.endsWith('"')) ||
        (content.startsWith("'") && content.endsWith("'"))
      ) {
        const key = content.slice(1, -1);
        return { parsedValue: Symbol(key) };
      }

      return { err: new Error("Invalid symbol format") };
    }
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
    if (trimmed.length > 100) {
      return { err: new Error("string can't be longer than 100 characters") };
    }
    result = trimmed.slice(1, -1);
  }
  if (!result) {
    return { err: new Error("no suitable type") };
  }
  return result;
}

export function validateInstanceName(
  varName: string,
  taken: Set<string>
): Error | undefined {
  if (!varName) {
    return new Error("Name for instance is required");
  }

  if (varName.length > 30) {
    return new Error("Name for instance can't be longer than 30 characters");
  }

  if (taken.has(varName)) {
    return new Error(" name for instance is allready used");
  }

  const allowedReg = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

  if (!allowedReg.test(varName)) {
    return new Error("no valid variable name syntax");
  }
}
