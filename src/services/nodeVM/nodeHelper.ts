export function parseReturnResult(
  value: unknown,
  propName?: string
): { parsedValue: string; type: string } {
  let parsedValue = "";
  let type = "";

  // Ermittle Type
  if (value instanceof Error) {
    type = "error";
  } else if (value instanceof Date) {
    type = "date";
  } else if (typeof value === "function") {
    type = "function";
  } else if (value === null) {
    type = "null";
  } else if (Array.isArray(value)) {
    type = "array";
  } else {
    type = typeof value;
  }

  // Konvertiere zu String
  try {
    if (value === null) {
      parsedValue = "null";
    } else if (value === undefined) {
      parsedValue = "undefined";
    } else if (value === false) {
      parsedValue = "false";
    } else if (value === true) {
      parsedValue = "true";
    } else if (value === 0) {
      parsedValue = "0";
    } else if (value === "") {
      parsedValue = '""';
    } else if (typeof value === "string") {
      parsedValue = `"${value}"`;
    } else if (typeof value === "number") {
      parsedValue = String(value);
    } else if (typeof value === "function") {
      parsedValue = `[Function: ${propName || "anonymous"}]`;
    } else if (typeof value === "object" && value !== null) {
      const jsonStr = JSON.stringify(value, null, 2);
      parsedValue =
        jsonStr.length > 100 ? jsonStr.substring(0, 100) + "..." : jsonStr;
    } else {
      parsedValue = String(value); // Fallback
    }
  } catch (err) {
    parsedValue = "[Nicht serialisierbar]";
  }

  return { type, parsedValue };
}
