import {
  CompiledRunMethodInInstanceTyp,
  CreateClassInstanceRessource,
  InstanceCheckRessource,
  InstanceParamType,
  PropInstanceType,
  RunMethodeInInstanceType,
} from "../../_resources/nodeVMResources";
import {
  compileClassMethod,
  createClassVM,
  extractClassInstanceProps,
} from "./nodeVMService";

// ! eventuell hier ehr Map<string, {VM-Objectobject, MorphInstanceAnalyse[] ,PropInstanceType[]}>

//Map<instanceName, [instanceObject, CurrentProps]>
const instanceMap = new Map<string, [object, PropInstanceType[]]>([]);

export function deleteInstanceInInstanceMap(instanceName: string) {
  instanceMap.delete(instanceName);
}

//ehr zum testen
export function clearInstanceMap() {
  instanceMap.clear();
}

function getInstanceFromInstanceMap(
  instanceName: string,
  getProps: boolean = false
): object | [object, PropInstanceType[]] {
  const tupelValue = instanceMap.get(instanceName);
  if (!tupelValue) {
    throw new Error(`Instance with name ${instanceName} was not found`);
  }
  return getProps ? tupelValue : tupelValue[0];
}

function setNewProps(instanceName: string, newProps: PropInstanceType[]) {
  const tupelValue = instanceMap.get(instanceName);
  if (!tupelValue) {
    throw new Error(`Instance with name ${instanceName} was not found`);
  }
  instanceMap.set(instanceName, [tupelValue[0], newProps]);
}

export async function addInstanceToInstanceMap(
  createClsInstanceRes: CreateClassInstanceRessource
): Promise<InstanceCheckRessource> {
  let result: InstanceCheckRessource = {
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
    let isInstanceParamType = (param: any): param is InstanceParamType => {
      return (
        typeof param === "object" &&
        typeof param.className === "string" &&
        typeof param.instanceName === "string"
      );
    };

    //übergebenen params nach instances checken
    for (
      let i = 0;
      i < myCreateClsInstanceRes.constructorParameter.length;
      i++
    ) {
      const param = myCreateClsInstanceRes.constructorParameter[i];
      if (isInstanceParamType(param)) {
        try {
          const ins = getInstanceFromInstanceMap(param.instanceName);
          myCreateClsInstanceRes.constructorParameter[i] = ins;
        } catch (err) {
          throw err;
        }
      }
    }
    console.log("zu übergebene ressource an node-vm: ", myCreateClsInstanceRes);

    const instance = await createClassVM(myCreateClsInstanceRes);
    if (!instance) {
      throw new Error("Instance konnte nicht erstellt werden");
    }

    //hole Props
    const myProps: PropInstanceType[] = await extractClassInstanceProps(
      instance
    );
    console.log("My Props: ", JSON.stringify(myProps, null, 2));
    result.props = myProps;

    instanceMap.set(createClsInstanceRes.instanceName, [instance, myProps]);
    result.isValid = true;
  } catch (err) {
    result.error = err;
  }
  return result;
}

export async function compileMethodInClassObject(
  runMethodeInInstanceType: RunMethodeInInstanceType
): Promise<CompiledRunMethodInInstanceTyp> {
  const compiledResult: CompiledRunMethodInInstanceTyp = {
    instanceName: runMethodeInInstanceType.instanceName,
    methodName: runMethodeInInstanceType.methodName,
    methodKind: runMethodeInInstanceType.specs.methodKind as
      | "default"
      | "get"
      | "set",
    isValid: false,
  };

  try {
    const tupelInstanceValue = getInstanceFromInstanceMap(
      runMethodeInInstanceType.instanceName,
      true
    ) as [object, PropInstanceType[]];

    if (!tupelInstanceValue) {
      throw new Error("Instanz nicht gefunden.");
    }

    const result = await compileClassMethod(
      tupelInstanceValue[0],
      runMethodeInInstanceType
    );
    compiledResult.isValid = true;

    let parsedValue = "";
    if (result === undefined || result === null) {
      parsedValue = "void";
    } else if (typeof result === "object") {
      try {
        parsedValue = JSON.stringify(result, null, 2);
      } catch {
        parsedValue = "[Unserializable Object]";
      }
    } else {
      try {
        parsedValue = result!.toString();
      } catch {
        parsedValue = result as string;
      }
    }
    compiledResult.returnValue = parsedValue;

    //hole aktuelle instance
    const curIns = getInstanceFromInstanceMap(
      runMethodeInInstanceType.instanceName
    );
    const newProps: PropInstanceType[] = await extractClassInstanceProps(
      curIns
    );

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
