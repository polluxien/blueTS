import { Path } from "typescript";
import path from "path";
import { addInstanceToInstanceMap } from "../../services/compileService/instanceManager";
import { CreateClassInstanceRequestType } from "../../_resources/request/objectRequest";
import { compileFunction } from "../../services/compileService/nodeVMService";
import { RunFunctionRequestType } from "../../_resources/request/functionRequest";

const tsFile = {
  name: "LogClass.ts",
  path: path.resolve(__dirname, "../mockCode/nodeVM/LogClass.ts") as Path,
};
describe("Teste ob Logs in Konstruckten erfolgreich erkannt werden --> KLASSE", () => {
  let instanceCheckRes;

  beforeAll(async () => {
    instanceCheckRes = await addInstanceToInstanceMap({
      instanceName: "testi_01",
      className: "LogClass",
      tsFile,
      params: [],
    } as CreateClassInstanceRequestType);

    expect(instanceCheckRes).toBeDefined();
    expect(instanceCheckRes.error).toBeUndefined();
    expect(instanceCheckRes.isValid).toBeTruthy();
  });

  test("loggs werden richtig mitgegebe --> DEFAULT", async () => {
    expect(instanceCheckRes!.logs).toBeDefined();

    expect(instanceCheckRes!.logs[0]).toContain("Hallo");
    expect(instanceCheckRes!.logs[1]).toContain("Das Ist ein Test");
  });

  test("loggs werden richtig mitgegebe --> WARNING", async () => {
    expect(instanceCheckRes!.logs[2]).toContain("Achtung Warnung");
  });

  test("loggs werden richtig mitgegebe --> ERROR", async () => {
    expect(instanceCheckRes!.logs[3]).toContain("Das ist ein error");
  });
});

describe("Teste ob Logs in Konstruckten erfolgreich erkannt werden --> FUNKTION", () => {
  let functionRes;

  beforeAll(async () => {
    functionRes = await compileFunction({
      functionName: "myLogFunction",
      specs: { isAsync: false },
      tsFile,
      params: [],
    } as RunFunctionRequestType);

    expect(functionRes).toBeDefined();
    expect(functionRes.error).toBeUndefined();
    expect(functionRes.isValid).toBeTruthy();
  });
  test("loggs werden richtig mitgegebe --> DEFAULT", async () => {
    expect(functionRes!.logs).toBeDefined();

    expect(functionRes!.logs[0]).toContain("Hallo");
    expect(functionRes!.logs[1]).toContain("Das Ist ein Test");
  });

  test("loggs werden richtig mitgegebe --> WARNING", async () => {
    expect(functionRes!.logs[2]).toContain("Achtung Warnung");
  });

  test("loggs werden richtig mitgegebe --> ERROR", async () => {
    expect(functionRes!.logs[3]).toContain("Das ist ein error");
  });
});
