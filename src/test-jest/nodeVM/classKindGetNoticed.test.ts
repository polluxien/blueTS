import { Path } from "typescript";
import path from "path";
import { InstanceCheckRessource } from "../../_resources/nodeVMResources";
import { addInstanceToInstanceMap } from "../../services/nodeVM/instanceManager";

const tsFile = {
  name: "classKinds.ts",
  path: path.resolve(__dirname, "../mockCode/nodeVM/classKinds.ts") as Path,
};
describe("Teste ob Alle bekannten TS-Arten von Klassen erkannt werden", () => {
  test("default KLasse (ohne export)", async () => {
    const instanceCheckRes: InstanceCheckRessource =
      await addInstanceToInstanceMap({
        instanceName: "testi_01",
        className: "Testi_01",
        tsFile,
        constructorParameter: [],
      });

    expect(instanceCheckRes).toBeDefined();
    expect(instanceCheckRes.error).toBeUndefined();
    expect(instanceCheckRes.isValid).toBeTruthy();
  });

  test("Klasse mit export", async () => {
    const instanceCheckRes: InstanceCheckRessource =
      await addInstanceToInstanceMap({
        instanceName: "testi_02",
        className: "Testi_02",
        tsFile,
        constructorParameter: [],
      });

    expect(instanceCheckRes).toBeDefined();
    expect(instanceCheckRes.error).toBeUndefined();
    expect(instanceCheckRes.isValid).toBeTruthy();
  });

  test("Klasse mit nachträglichen export", async () => {
    const instanceCheckRes: InstanceCheckRessource =
      await addInstanceToInstanceMap({
        instanceName: "testi_03",
        className: "Testi_03",
        tsFile,
        constructorParameter: [],
      });

    expect(instanceCheckRes).toBeDefined();
    expect(instanceCheckRes.error).toBeUndefined();
    expect(instanceCheckRes.isValid).toBeTruthy();
  });

  test("Klasse mit default export", async () => {
    const instanceCheckRes: InstanceCheckRessource =
      await addInstanceToInstanceMap({
        instanceName: "testi_04",
        className: "Testi_04",
        tsFile,
        constructorParameter: [],
      });

    expect(instanceCheckRes).toBeDefined();
    expect(instanceCheckRes.error).toBeUndefined();
    expect(instanceCheckRes.isValid).toBeTruthy();
  });
});
