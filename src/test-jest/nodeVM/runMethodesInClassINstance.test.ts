import path from "path";
import {
  CreateClassInstanceRessource,
  RunMethodeInInstanceType,
} from "../../nodeVM/instanceResources";
import { Path } from "typescript";
import {
  addInstanceToInstanceMap,
  clearInstanceMap,
  compileMethodInClassObject,
} from "../../nodeVM/instanceManager";

describe("Erstelle eine Klasse und führe methoden richtig aus", () => {
  //erstelle zu anfang jedem tests eine neue Instanz
  beforeEach(async () => {
    const myCreateClsInstanceRes: CreateClassInstanceRessource = {
      instanceName: "testii",
      className: "Person",
      tsFile: {
        name: `testClassMethods.ts`,
        path: path.resolve(
          __dirname,
          `../mockCode/nodeVM/testClassMethods.ts`
        ) as Path,
      },
      constructorParameter: ["Albert", 40],
    };
    const result = await addInstanceToInstanceMap(myCreateClsInstanceRes);
    //console.log("Aktueller Instance-Zustand:", result);
  });

  //lösche nach jedem test die instanz aus der map
  afterEach(() => {
    clearInstanceMap();
  });

  test("teste get age(): number", async () => {
    const myRunMethodeInInstanceType: RunMethodeInInstanceType = {
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
      returnValue: "40",
    });
  });

  test("teste get age(): number -> mit Parametern (Fehler)", async () => {
    await expect(
      compileMethodInClassObject({
        instanceName: "testii",
        methodName: "age",
        params: [123],
        specs: { methodKind: "get", isAsync: false },
      })
    ).rejects.toThrow("Getter 'age' benötigt keine Parameter");
  });

  test("teste set age(number): void", async () => {
    let myRunMethodeInInstanceType: RunMethodeInInstanceType = {
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
      returnValue: "void",
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
      returnValue: "70",
    });
  });

  test("teste set age(number): void -> mit negativem Wert (Fehler)", async () => {
    await expect(
      compileMethodInClassObject({
        instanceName: "testii",
        methodName: "age",
        params: [-5],
        specs: { methodKind: "set", isAsync: false },
      })
    ).rejects.toThrow("Alter darf nicht negativ sein.");
  });

  test("teste set age(number): void -> ohne Parameter (Fehler)", async () => {
    await expect(
      compileMethodInClassObject({
        instanceName: "testii",
        methodName: "age",
        params: [],
        specs: { methodKind: "set", isAsync: false },
      })
    ).rejects.toThrow("Setter 'age' benötigt einen Parameter");
  });

  test("teste greet(string): string ", async () => {
    const myRunMethodeInInstanceType: RunMethodeInInstanceType = {
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
    expect(result).toEqual("Hallo Basti, mein Name ist Albert.");
  });

  test("teste greet(string): string -> mit leerem String", async () => {
    const result = await compileMethodInClassObject({
      instanceName: "testii",
      methodName: "greet",
      params: [""],
      specs: { methodKind: "default", isAsync: false },
    });

    expect(result).toEqual("Hallo , mein Name ist Albert.");
  });

  test("teste async fetchData(): Promise<string>", async () => {
    const myRunMethodeInInstanceType: RunMethodeInInstanceType = {
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
    expect(result).toEqual("Daten erfolgreich geladen!");
  });

  test("teste Zugriff auf nicht existierende Methode", async () => {
    await expect(
      compileMethodInClassObject({
        instanceName: "testii",
        methodName: "nonExistent",
        params: [],
        specs: { methodKind: "default", isAsync: false },
      })
    ).rejects.toThrow("Methode 'nonExistent' konnte nicht gefunden werden");
  });
});
