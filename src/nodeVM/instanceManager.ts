import {
  CreateClassInstanceRessource,
  InstanceCheckRessource,
} from "./instanceResources";
import { compileClassMethod, createClassVM } from "./instanceService";

const instanceMap = new Map<string, object>();

export function getInstanceMap() {
  return instanceMap;
}

export function deleteInstanceInInstanceMap(instanceName: string) {
  try {
    instanceMap.delete(instanceName);
  } catch (err) {
    throw err;
  }
}

//ehr zum testen
export function clearInstanceMap() {
  instanceMap.clear();
}

export function getInstanceFromInstanceMap(instanceName: string) {
  try {
    return instanceMap.get(instanceName);
  } catch (err) {
    throw err;
  }
}

export async function addInstanceToInstanceMap(
  createClsInstanceRes: CreateClassInstanceRessource
): Promise<InstanceCheckRessource> {
  let result: InstanceCheckRessource = {
    instanceName: createClsInstanceRes.instanceName,
    isValid: false,
    error: undefined,
  };
  try {
    const instance = await createClassVM(createClsInstanceRes);
    if (!instance) {
      throw new Error("Instance konnte nicht erstellt werden");
    }
    instanceMap.set(createClsInstanceRes.instanceName, instance);
    result.isValid = true;
  } catch (err) {
    result.error = err;
  }
  return result;
}

export type RunMethodeInInstanceType = {
  instanceName: string;
  methodName: string;
  params: unknown[];
  specs: {
    methodKind: "default" | "get" | "set";
    isAsync: boolean;
  };
};

export type CompiledRunMethodInInstanceTyp = {
  instanceName: string;
  methodName: string;
  isValid: boolean;
  returnValue?: string;
  error?: Error;
};

export async function compileMethodInClassObject(
  runMethodeInInstanceType: RunMethodeInInstanceType
): Promise<CompiledRunMethodInInstanceTyp> {
  const compiledResult: CompiledRunMethodInInstanceTyp = {
    instanceName: runMethodeInInstanceType.instanceName,
    methodName: runMethodeInInstanceType.methodName,
    isValid: false,
  };

  try {
    const instance = getInstanceFromInstanceMap(
      runMethodeInInstanceType.instanceName
    );

    if (!instance) {
      throw new Error("Instanz nicht gefunden.");
    }

    const result = await compileClassMethod(instance, runMethodeInInstanceType);
    compiledResult.isValid = true;
    compiledResult.returnValue = result ? result.toString() : "void";
  } catch (err) {
    console.error("Fehler bei compileMethodInClassObject:", err);
    compiledResult.error = err instanceof Error ? err : new Error(String(err));
  }

  return compiledResult;
}
