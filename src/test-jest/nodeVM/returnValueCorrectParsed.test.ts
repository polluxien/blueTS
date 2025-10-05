import path from "path";
import { compileFunction } from "../../services/compileService/nodeVMService";
import { Path } from "typescript";
import { RunFunctionRequestType } from "../../_resources/request/functionRequest";

const tsFile = {
  name: "LogClass.ts",
  path: path.resolve(__dirname, "../mockCode/nodeVM/ReturnValues.ts") as Path,
};
describe("Teste ob return Values korrekt geparsed werden ", () => {
  test("Value --> String", async () => {
    const functionRes = await compileFunction({
      functionName: "stringReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();

    expect(functionRes.returnValue).toBe("Hello World");
  });
  test("Value --> number", async () => {
    const functionRes = await compileFunction({
      functionName: "numberReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();

    expect(functionRes.returnValue).toBe("42");
  });
  test("Value --> array", async () => {
    const functionRes = await compileFunction({
      functionName: "arrayReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();

    expect(functionRes.returnValue).toBe(`[1,2,3,4,5]`);
  });
  test("Value --> boolean", async () => {
    const functionRes = await compileFunction({
      functionName: "booleanReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();

    expect(functionRes.returnValue).toBe("true");
  });
  test("Value --> object", async () => {
    const functionRes = await compileFunction({
      functionName: "objectReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();

    expect(functionRes.returnValue).toBe(`{"name":"John","age":30}`);
  });
  test("Value --> null", async () => {
    const functionRes = await compileFunction({
      functionName: "nullReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();

    expect(functionRes.returnValue).toBe("null");
  });

  test("Value --> undefined", async () => {
    const functionRes = await compileFunction({
      functionName: "undefinedReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();

    expect(functionRes.returnValue).toBe(undefined);
  });
  test("Value --> void", async () => {
    const functionRes = await compileFunction({
      functionName: "voidReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();

    expect(functionRes.returnValue).toBeUndefined();
  });
  test("Value --> tupel", async () => {
    const functionRes = await compileFunction({
      functionName: "tupleReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();

    expect(functionRes.returnValue).toBe(`["Alice",25,true]`);
  });

  //! empty object
  test("Value --> Promise<string>", async () => {
    const functionRes = await compileFunction({
      functionName: "promiseReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();

    expect(functionRes.returnValue).toBe("[Promise]");
  });

  test("Value --> array object", async () => {
    const functionRes = await compileFunction({
      functionName: "arrayOfObjectsReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();

    expect(functionRes.returnValue).toBe(
      `[{"id":1,"name":"Item 1"},{"id":2,"name":"Item 2"}]`
    );
  });

  test("Value --> literal", async () => {
    const functionRes = await compileFunction({
      functionName: "literalReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();

    expect(functionRes.returnValue).toBe("success");
  });
  test("Value --> Error", async () => {
    const functionRes = await compileFunction({
      functionName: "errorReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();

    console.log(functionRes);
  });

  test("Value --> throw Error", async () => {
    const functionRes = await compileFunction({
      functionName: "throwError",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeDefined();
    expect(functionRes.isValid).toBeFalsy();

    expect(functionRes.returnValue).toBeUndefined();
    expect(functionRes.error).toBe("Error: This function always throws");
  });
  test("Value --> custom error", async () => {
    const functionRes = await compileFunction({
      functionName: "customErrorReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);
    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();
    expect(functionRes.returnValue).toContain("Error: Not found");
  });

  test("Value --> try-catch pattern", async () => {
    const functionRes = await compileFunction({
      functionName: "tryCatchReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);
    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();
    expect(functionRes.returnValue).toBe("Operation successful");
  });

  test("Value --> date", async () => {
    const functionRes = await compileFunction({
      functionName: "dateReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);
    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();
    // Date wird als ISO String serialisiert
    expect(functionRes.returnValue).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  test("Value --> regex", async () => {
    const functionRes = await compileFunction({
      functionName: "regexReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);
    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();
    expect(functionRes.returnValue).toBe("/[a-z]+/g");
  });

  test("Value --> symbol", async () => {
    const functionRes = await compileFunction({
      functionName: "symbolReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);
    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();
    expect(functionRes.returnValue).toContain("Symbol(unique)");
  });

  test("Value --> bigint", async () => {
    const functionRes = await compileFunction({
      functionName: "bigIntReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);
    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();
    expect(functionRes.returnValue).toBe("9007199254740991");
  });

  test("Value --> map", async () => {
    const functionRes = await compileFunction({
      functionName: "mapReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);
    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();
    // Map wird als Array von Entries serialisiert
    expect(functionRes.returnValue).toContain('"a"');
    expect(functionRes.returnValue).toContain('"b"');
  });

  test("Value --> set", async () => {
    const functionRes = await compileFunction({
      functionName: "setReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);
    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();
    expect(functionRes.returnValue).toBe("[1,2,3]");
  });

  test("Value --> weakmap", async () => {
    const functionRes = await compileFunction({
      functionName: "weakMapReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);
    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();
    // WeakMap kann nicht serialisiert werden
    expect(functionRes.returnValue).toBe("{}");
  });

  test("Value --> function", async () => {
    const functionRes = await compileFunction({
      functionName: "functionReturn",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);
    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();
    // Funktionen werden als String dargestellt
    expect(functionRes.returnValue).toContain("function");
  });
});
