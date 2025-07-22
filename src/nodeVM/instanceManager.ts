import { TsFileResource } from "../fileService/fileResources";
import { ParameterRessource } from "../tsCompilerApi/tsCompilerAPIRessourcees";
import { compileClassMethod, createClassVM } from "./instanceService";

export type CreateClassInstanceRessource = {
  instanceName: string;
  className: string;
  tsFile: TsFileResource;
  constructorParameter: any[];
};

export type ClassInstanceConstructionFunctionRessource = {
  functionName: string;
  parameter: ParameterRessource;
};

export type ClassInstanceConstructionRessource = {
  className: string;
  instanceName: string;
  function: ClassInstanceConstructionFunctionRessource[];
};

export type InstanceCheckRessource = {
  instanceName: string;
  isValid: boolean;
  error: unknown;
};

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
    if (!instance) throw new Error("Instance konnte nicht erstellt werden");
    instanceMap.set(createClsInstanceRes.className, instance);
    result.isValid = true;
  } catch (err) {
    result.error = err;
  }
  return result;
}

export async function compileMethodInClassObject(instanceName: string) {
  try {
    const instance = getInstanceFromInstanceMap(instanceName);
    if (!instance) throw new Error();

    const dotdotdot = compileClassMethod(instance, "", []);
  } catch (err) {
    throw err;
  }
}
