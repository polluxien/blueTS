import { Path } from "typescript";
import {
  addInstanceToInstanceMap,
} from "../../nodeVM/instanceManager";
import { InstanceCheckRessource } from "../../nodeVM/instanceResources";

describe("Teste ob Alle bekannten TS-Arten von Klassen erkannt werden", () => {
  test("default KLasse (ohne export)", async () => {
    const instanceCheckRes: InstanceCheckRessource =
      await addInstanceToInstanceMap({
        instanceName: "testi_01",
        className: "Testi_01",
        tsFile: {
          name: "classKinds.ts",
          path: "/Users/bennet/redj/src/test-jest/mockCode/classKinds.ts" as Path,
        },
        constructorParameter: [],
      });

    expect(instanceCheckRes).toBeDefined();
    expect(instanceCheckRes.error).toBeUndefined();
    expect(instanceCheckRes.isValid).toBeTruthy();
  });

  test("Klasse mit export", async () => {
    const instanceCheckRes: InstanceCheckRessource =
      await addInstanceToInstanceMap({
        instanceName: "testi_01",
        className: "Testi_01",
        tsFile: {
          name: "classKinds.ts",
          path: "/Users/bennet/redj/src/test-jest/mockCode/classKinds.ts" as Path,
        },
        constructorParameter: [],
      });

    expect(instanceCheckRes).toBeDefined();
    expect(instanceCheckRes.error).toBeUndefined();
    expect(instanceCheckRes.isValid).toBeTruthy();
  });

  test("Klasse mit nachträglichen export", async () => {
    const instanceCheckRes: InstanceCheckRessource =
      await addInstanceToInstanceMap({
        instanceName: "testi_01",
        className: "Testi_01",
        tsFile: {
          name: "classKinds.ts",
          path: "/Users/bennet/redj/src/test-jest/mockCode/classKinds.ts" as Path,
        },
        constructorParameter: [],
      });

    expect(instanceCheckRes).toBeDefined();
    expect(instanceCheckRes.error).toBeUndefined();
    expect(instanceCheckRes.isValid).toBeTruthy();
  });

  test("Klasse mit default export", async () => {
    const instanceCheckRes: InstanceCheckRessource =
      await addInstanceToInstanceMap({
        instanceName: "testi_01",
        className: "Testi_01",
        tsFile: {
          name: "classKinds.ts",
          path: "/Users/bennet/redj/src/test-jest/mockCode/classKinds.ts" as Path,
        },
        constructorParameter: [],
      });

    expect(instanceCheckRes).toBeDefined();
    expect(instanceCheckRes.error).toBeUndefined();
    expect(instanceCheckRes.isValid).toBeTruthy();
  });
});
