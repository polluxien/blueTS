import {
  InstanceParamType,
  CompiledPropInstanceType,
} from "../../_resources/nodeVMResources";
import {
  CreateClassInstanceRequestType,
  RunMethodInInstanceRequestType,
} from "../../_resources/request/objectRequest";
import {
  CompiledMethodInInstanceResponseTyp,
  InstanceCheckResponseType,
} from "../../_resources/response/objectResponse";
import { parseReturnResult } from "./nodeHelper";
import {
  compileInstanceMethod,
  createClassInstanceVM,
  extractClassInstanceProps,
} from "./nodeVMService";
import { normalizeParam } from "./typeCheckerHelper";

// ! eventuell hier ehr Map<string, {VM-Objectobject, MorphInstanceAnalyse[] ,PropInstanceType[]}>

//Map<instanceName, [instanceObject, CurrentProps]>
const instanceMap = new Map<string, [object, CompiledPropInstanceType[]]>([]);

export function deleteInstanceInInstanceMap(instanceName: string) {
  instanceMap.delete(instanceName);
}

//ehr zum testen
export function clearInstanceMap() {
  instanceMap.clear();
}

export function getInstanceFromInstanceMap(
  instanceName: string,
  getProps: boolean = false
): object | [object, CompiledPropInstanceType[]] {
  const tupelValue = instanceMap.get(instanceName);
  if (!tupelValue) {
    throw new Error(`Instance with name ${instanceName} was not found`);
  }
  return getProps ? tupelValue : tupelValue[0];
}

function setNewProps(
  instanceName: string,
  newProps: CompiledPropInstanceType[]
) {
  const tupelValue = instanceMap.get(instanceName);
  if (!tupelValue) {
    throw new Error(`Instance with name ${instanceName} was not found`);
  }
  instanceMap.set(instanceName, [tupelValue[0], newProps]);
}

export async function addInstanceToInstanceMap(
  createClsInstanceRes: CreateClassInstanceRequestType
): Promise<InstanceCheckResponseType> {
  let result: InstanceCheckResponseType = {
    instanceName: createClsInstanceRes.instanceName,
    props: [],
    isValid: false,
    error: undefined,
  };
  try {
    if (instanceMap.get(createClsInstanceRes.instanceName)) {
      throw new Error(
        `instance with name ${createClsInstanceRes.instanceName} allready exists`
      );
    }

    let myCreateClsInstanceRes = createClsInstanceRes;

    //übergebenen params nach instances checken
    myCreateClsInstanceRes.params =
      myCreateClsInstanceRes.params.flatMap(normalizeParam);

    console.log("zu übergebene ressource an node-vm: ", myCreateClsInstanceRes);

    const { myInstance, collectedLogsArr } = await createClassInstanceVM(
      myCreateClsInstanceRes
    );

    if (!myInstance) {
      throw new Error("Instance konnte nicht erstellt werden");
    }
    if (collectedLogsArr.length > 0) {
      result.logs = collectedLogsArr;
    }

    //hole Props
    const myProps: CompiledPropInstanceType[] = await extractClassInstanceProps(
      myInstance
    );
    console.log("My Props: ", JSON.stringify(myProps, null, 2));
    result.props = myProps ?? [];

    instanceMap.set(createClsInstanceRes.instanceName, [myInstance, myProps]);
    result.isValid = true;
  } catch (err) {
    result.error = err as Error | undefined;
  }
  return result;
}

export async function compileMethodInClassObject(
  runMethodeInInstanceType: RunMethodInInstanceRequestType
): Promise<CompiledMethodInInstanceResponseTyp> {
  const compiledResult: CompiledMethodInInstanceResponseTyp = {
    instanceName: runMethodeInInstanceType.instanceName,
    methodName: runMethodeInInstanceType.methodName,
    methodKind: runMethodeInInstanceType.specs.methodKind as
      | "default"
      | "get"
      | "set",
    isValid: false,
  };

  try {
    runMethodeInInstanceType.params =
      runMethodeInInstanceType.params.flatMap(normalizeParam);

    const tupelInstanceValue = getInstanceFromInstanceMap(
      runMethodeInInstanceType.instanceName,
      true
    ) as [object, CompiledPropInstanceType[]];

    if (!tupelInstanceValue) {
      throw new Error("Instanz nicht gefunden.");
    }

    const { result, collectedLogsArr } = await compileInstanceMethod(
      tupelInstanceValue[0],
      runMethodeInInstanceType
    );

    if (collectedLogsArr.length > 0) {
      compiledResult.logs = collectedLogsArr;
    }

    compiledResult.isValid = true;

    compiledResult.returnValue = parseReturnResult(result);

    //hole aktuelle instance
    const curIns = getInstanceFromInstanceMap(
      runMethodeInInstanceType.instanceName
    );
    const newProps: CompiledPropInstanceType[] =
      await extractClassInstanceProps(curIns);

    //vergleiche alten props mit aktuellen props und gebe bei bedarf die neuen props mit
    const propsChanged =
      tupelInstanceValue[1].length !== newProps.length ||
      tupelInstanceValue[1].some(
        (oldProp, i) =>
          oldProp.name !== newProps[i].name ||
          oldProp.type !== newProps[i].type ||
          oldProp.value !== newProps[i].value
      );

    if (propsChanged) {
      console.log("New Props: ", JSON.stringify(newProps, null, 2));
      setNewProps(runMethodeInInstanceType.instanceName, newProps);
      compiledResult.newProps = newProps;
    }
  } catch (err) {
    console.error("Fehler bei compileMethodInClassObject:", err);
    compiledResult.error = err instanceof Error ? err : new Error(String(err));
  }
  console.log("Compile Result Backend: ", compiledResult);
  return compiledResult;
}
