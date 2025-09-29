import { Path } from "typescript";
import path from "path";
import { addInstanceToInstanceMap } from "../../services/nodeVM/instanceManager";
import { InstanceCheckResponseType } from "../../_resources/response/objectResponse";
import { CreateClassInstanceRequestType } from "../../_resources/request/objectRequest";

const tsFile = {
  name: "classKinds.ts",
  path: path.resolve(__dirname, "../mockCode/nodeVM/classKinds.ts") as Path,
};
describe("Teste ob Alle bekannten TS-Arten von Klassen erkannt werden", () => {
  test("default KLasse (ohne export)", async () => {
    const instanceCheckRes: InstanceCheckResponseType =
      await addInstanceToInstanceMap({
        instanceName: "testi_01",
        className: "Testi_01",
        tsFile,
        params: [],
      } as CreateClassInstanceRequestType);

    expect(instanceCheckRes).toBeDefined();
    expect(instanceCheckRes.error).toBeUndefined();
    expect(instanceCheckRes.isValid).toBeTruthy();
  });

  test("Klasse mit export", async () => {
    const instanceCheckRes: InstanceCheckResponseType =
      await addInstanceToInstanceMap({
        instanceName: "testi_02",
        className: "Testi_02",
        tsFile,
        params: [],
      });

    expect(instanceCheckRes).toBeDefined();
    expect(instanceCheckRes.error).toBeUndefined();
    expect(instanceCheckRes.isValid).toBeTruthy();
  });

  test("Klasse mit nachträglichen export", async () => {
    const instanceCheckRes: InstanceCheckResponseType =
      await addInstanceToInstanceMap({
        instanceName: "testi_03",
        className: "Testi_03",
        tsFile,
        params: [],
      });

    expect(instanceCheckRes).toBeDefined();
    expect(instanceCheckRes.error).toBeUndefined();
    expect(instanceCheckRes.isValid).toBeTruthy();
  });

  test("Klasse mit default export", async () => {
    const instanceCheckRes: InstanceCheckResponseType =
      await addInstanceToInstanceMap({
        instanceName: "testi_04",
        className: "Testi_04",
        tsFile,
        params: [],
      });

    expect(instanceCheckRes).toBeDefined();
    expect(instanceCheckRes.error).toBeUndefined();
    expect(instanceCheckRes.isValid).toBeTruthy();
  });
});
