export function parseReturnResult(result: unknown): string {
  /*
  console.log(result);
  console.log("Constructor name:", result?.constructor?.name);
  */

  if (typeof result === "string") {
    return result;
  }

  // ? special cases
  const constructorName = result?.constructor?.name;

  // Map
  if (constructorName === "Map") {
    return JSON.stringify(Array.from((result as Map<any, any>).entries()));
  }

  // Set
  if (constructorName === "Set") {
    return JSON.stringify(Array.from(result as Set<any>));
  }

  // Date
  if (constructorName === "Date") {
    return (result as Date).toISOString();
  }

  // regEx
  if (constructorName === "RegExp") {
    return (result as RegExp).toString();
  }

  // Error
  if (constructorName === "Error" || result instanceof Error) {
    const err = result as Error;
    return `${err.name}: ${err.message}`;
  }

  if (result instanceof Promise || constructorName === "Promise") {
    return "[Promise]"; 
  }

  // Symbol, bigInt und function
  if (
    typeof result === "symbol" ||
    typeof result === "bigint" ||
    typeof result === "function"
  ) {
    return result.toString();
  }

  // Standard JSON
  return JSON.stringify(result);
}
