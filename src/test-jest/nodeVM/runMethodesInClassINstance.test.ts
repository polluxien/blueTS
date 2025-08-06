import path from "path";
import { CreateClassInstanceRessource } from "../../nodeVM/instanceResources";
import { Path } from "typescript";
import {
  addInstanceToInstanceMap,
  clearInstanceMap,
  compileMethodInClassObject,
  getInstanceFromInstanceMap,
  RunMethodeInInstanceType,
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
      specifics: {
        methodKind: "get",
        isAsync: false,
      },
    };
    const result = await compileMethodInClassObject(myRunMethodeInInstanceType);

    expect(result).toBeDefined();
    expect(result).toEqual("40");
  });

  test("teste set age(number): void", async () => {
    let myRunMethodeInInstanceType: RunMethodeInInstanceType = {
      instanceName: "testii",
      methodName: "age",
      params: [70],
      specifics: {
        methodKind: "set",
        isAsync: false,
      },
    };
    let result = await compileMethodInClassObject(myRunMethodeInInstanceType);

    expect(result).not.toBeDefined();

    myRunMethodeInInstanceType = {
      instanceName: "testii",
      methodName: "age",
      params: [],
      specifics: {
        methodKind: "get",
        isAsync: false,
      },
    };
    result = await compileMethodInClassObject(myRunMethodeInInstanceType);

    expect(result).toBeDefined();
    expect(result).toEqual("70");
  });

  test("teste greet(string): string ", async () => {
    const myRunMethodeInInstanceType: RunMethodeInInstanceType = {
      instanceName: "testii",
      methodName: "greet",
      params: ["Basti"],
      specifics: {
        methodKind: "default",
        isAsync: false,
      },
    };
    const result = await compileMethodInClassObject(myRunMethodeInInstanceType);

    expect(result).toBeDefined();
    expect(result).toEqual("Hallo Basti, mein Name ist Albert.");
  });

  test("teste async fetchData(): Promise<string>", async () => {
    const myRunMethodeInInstanceType: RunMethodeInInstanceType = {
      instanceName: "testii",
      methodName: "fetchData",
      params: [],
      specifics: {
        methodKind: "default",
        isAsync: true,
      },
    };
    const result = await compileMethodInClassObject(myRunMethodeInInstanceType);

    expect(result).toBeDefined();
    expect(result).toEqual("Daten erfolgreich geladen!");
  });
});
