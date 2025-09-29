// String Return
function stringReturn(): string {
  return "Hello World";
}

// Number Return
function numberReturn(): number {
  return 42;
}

// Boolean Return
function booleanReturn(): boolean {
  return true;
}

// Array Return
function arrayReturn(): number[] {
  return [1, 2, 3, 4, 5];
}

// Object Return
function objectReturn(): { name: string; age: number } {
  return { name: "John", age: 30 };
}

// Null Return
function nullReturn(): null {
  return null;
}

// Undefined Return
function undefinedReturn(): undefined {
  return undefined;
}

// Void Return (nichts zurückgeben)
function voidReturn(): void {
  console.log("This returns nothing");
}

// Tuple Return
function tupleReturn(): [string, number, boolean] {
  return ["Alice", 25, true];
}

// Promise Return
function promiseReturn(): Promise<string> {
  return Promise.resolve("async result");
}

// Array of Objects Return
function arrayOfObjectsReturn(): Array<{ id: number; name: string }> {
  return [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
  ];
}

// Literal Type Return
function literalReturn(): "success" | "error" {
  return "success";
}

// Error Return
function errorReturn(): Error {
  return new Error("Something went wrong");
}

// Throwing Function (never returns)
function throwError(): never {
  throw new Error("This function always throws");
}

// Custom Error Return
class CustomError extends Error {
  constructor(public code: number, message: string) {
    super(message);
  }
}

function customErrorReturn(): CustomError {
  return new CustomError(404, "Not found");
}

// Either Success or Error
function resultReturn():
  | { success: true; data: string }
  | { success: false; error: Error } {
  if (Math.random() > 0.5) {
    return { success: true, data: "Success!" };
  }
  return { success: false, error: new Error("Failed") };
}

// Try-Catch Pattern
function tryCatchReturn(): string | Error {
  try {
    return "Operation successful";
  } catch (e) {
    return e instanceof Error ? e : new Error("Unknown error");
  }
}

// Date Return
function dateReturn(): Date {
  return new Date();
}

// RegExp Return
function regexReturn(): RegExp {
  return /[a-z]+/g;
}

// Symbol Return
function symbolReturn(): symbol {
  return Symbol("unique");
}

// BigInt Return
function bigIntReturn(): bigint {
  return 9007199254740991n;
}

// Map Return
function mapReturn(): Map<string, number> {
  return new Map([
    ["a", 1],
    ["b", 2],
  ]);
}

// Set Return
function setReturn(): Set<number> {
  return new Set([1, 2, 3]);
}

// WeakMap Return
function weakMapReturn(): WeakMap<object, string> {
  const obj = {};
  const wm = new WeakMap();
  wm.set(obj, "value");
  return wm;
}

// Function Return (Higher-order function)
function functionReturn(): (x: number) => number {
  return (x) => x * 2;
}
