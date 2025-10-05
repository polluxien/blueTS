import path from "path";

import { Path } from "typescript";
import {
  addInstanceToInstanceMap,
  clearInstanceMap,
  compileMethodInClassObject,
} from "../../services/compileService/instanceManager";
import {
  CreateClassInstanceRequestType,
  RunMethodInInstanceRequestType,
} from "../../_resources/request/objectRequest";

describe("Erstelle eine Klasse und führe methoden richtig aus", () => {
  //erstelle zu anfang jedem tests eine neue Instanz
  beforeEach(async () => {
    const myCreateClsInstanceRes: CreateClassInstanceRequestType = {
      instanceName: "testii",
      className: "Person",
      tsFile: {
        name: `testClassMethods.ts`,
        path: path.resolve(
          __dirname,
          `../mockCode/nodeVM/ClassMethodsTest.ts`
        ) as Path,
      },
      params: ["Albert", 40],
    };
    const result = await addInstanceToInstanceMap(myCreateClsInstanceRes);
    //console.log("Aktueller Instance-Zustand:", result);
  });

  //lösche nach jedem test die instanz aus der map
  afterEach(() => {
    clearInstanceMap();
  });

  test("teste get age(): number", async () => {
    const myRunMethodeInInstanceType: RunMethodInInstanceRequestType = {
      instanceName: "testii",
      methodName: "age",
      params: [],
      specs: {
        methodKind: "get",
        isAsync: false,
      },
    };
    const result = await compileMethodInClassObject(myRunMethodeInInstanceType);

    expect(result).toBeDefined();
    expect(result).toEqual({
      instanceName: "testii",
      isValid: true,
      methodName: "age",
      methodKind: "get",
      returnValue: "40",
    });
  });

  test("teste get age(): number -> mit Parametern (Fehler)", async () => {
    const result = await compileMethodInClassObject({
      instanceName: "testii",
      methodName: "age",
      params: [123],
      specs: { methodKind: "get", isAsync: false },
    });

    expect(result).toBeDefined();
    expect(result.isValid).toBeFalsy();

    expect(result.error).toBeDefined();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error!.message).toBe("Getter 'age' benötigt keine Parameter");
  });

  test("teste set age(number): void", async () => {
    let myRunMethodeInInstanceType: RunMethodInInstanceRequestType = {
      instanceName: "testii",
      methodName: "age",
      params: [70],
      specs: {
        methodKind: "set",
        isAsync: false,
      },
    };
    let result = await compileMethodInClassObject(myRunMethodeInInstanceType);

    expect(result).toBeDefined();
    expect(result).toEqual({
      instanceName: "testii",
      isValid: true,
      methodName: "age",
      methodKind: "set",
      returnValue: "void",
      newProps: [
        {
          name: "name",
          type: "string",
          value: `"Albert"`,
        },
        {
          name: "_age",
          type: "number",
          value: "70",
        },
      ],
    });

    myRunMethodeInInstanceType = {
      instanceName: "testii",
      methodName: "age",
      params: [],
      specs: {
        methodKind: "get",
        isAsync: false,
      },
    };
    result = await compileMethodInClassObject(myRunMethodeInInstanceType);

    expect(result).toBeDefined();
    expect(result).toEqual({
      instanceName: "testii",
      isValid: true,
      methodName: "age",
      methodKind: "get",
      returnValue: "70",
    });
  });

  test("teste set age(number): void -> mit negativem Wert (Fehler)", async () => {
    const result = await compileMethodInClassObject({
      instanceName: "testii",
      methodName: "age",
      params: [-5],
      specs: { methodKind: "set", isAsync: false },
    });

    expect(result).toBeDefined();
    expect(result.isValid).toBeFalsy();

    expect(result.error).toBeDefined();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error!.message).toBe("Error: Alter darf nicht negativ sein.");
  });

  test("teste set age(number): void -> ohne Parameter (Fehler)", async () => {
    const result = await compileMethodInClassObject({
      instanceName: "testii",
      methodName: "age",
      params: [],
      specs: { methodKind: "set", isAsync: false },
    });
    expect(result).toBeDefined();
    expect(result.isValid).toBeFalsy();

    expect(result.error).toBeDefined();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error!.message).toBe("Setter 'age' benötigt einen Parameter");
  });

  test("teste greet(string): string ", async () => {
    const myRunMethodeInInstanceType: RunMethodInInstanceRequestType = {
      instanceName: "testii",
      methodName: "greet",
      params: ["Basti"],
      specs: {
        methodKind: "default",
        isAsync: false,
      },
    };
    const result = await compileMethodInClassObject(myRunMethodeInInstanceType);

    expect(result).toBeDefined();
    expect(result).toEqual({
      instanceName: "testii",
      isValid: true,
      methodName: "greet",
      methodKind: "default",
      returnValue: "Hallo Basti, mein Name ist Albert.",
    });
  });

  test("teste greet(string): string -> mit leerem String", async () => {
    const result = await compileMethodInClassObject({
      instanceName: "testii",
      methodName: "greet",
      params: [""],
      specs: { methodKind: "default", isAsync: false },
    });

    expect(result).toBeDefined();
    expect(result).toEqual({
      instanceName: "testii",
      isValid: true,
      methodName: "greet",
      methodKind: "default",
      returnValue: "Hallo , mein Name ist Albert.",
    });
  });

  test("teste async fetchData(): Promise<string>", async () => {
    const myRunMethodeInInstanceType: RunMethodInInstanceRequestType = {
      instanceName: "testii",
      methodName: "fetchData",
      params: [],
      specs: {
        methodKind: "default",
        isAsync: true,
      },
    };
    const result = await compileMethodInClassObject(myRunMethodeInInstanceType);

    expect(result).toBeDefined();
    expect(result).toEqual({
      instanceName: "testii",
      isValid: true,
      methodName: "fetchData",
      methodKind: "default",
      returnValue: "Daten erfolgreich geladen!",
    });
  });

  test("teste Zugriff auf nicht existierende Methode", async () => {
    const result = await compileMethodInClassObject({
      instanceName: "testii",
      methodName: "nonExistent",
      params: [],
      specs: { methodKind: "default", isAsync: false },
    });
    expect(result).toBeDefined();
    expect(result.isValid).toBeFalsy();

    expect(result.error).toBeDefined();
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error!.message).toBe(
      "Methode 'nonExistent' konnte nicht gefunden werden"
    );
  });
});
