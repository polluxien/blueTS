export function parseReturnResult(result: unknown): string {
  let parsedValue = "";
  if (result === undefined || result === null) {
    parsedValue = "void";
  } else if (typeof result === "object") {
    try {
      parsedValue = JSON.stringify(result, null, 2);
    } catch {
      parsedValue = "[Unserializable Object]";
    }
  } else {
    try {
      parsedValue = result!.toString();
    } catch {
      parsedValue = result as string;
    }
  }
  return parsedValue;
}
