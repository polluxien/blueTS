import { useEffect, useRef, useState } from "react";
import type {
  ClassResource,
  CompiledRunMethodInInstanceTyp,
  FunctionResource,
  InstanceCheckResource,
  InstanceResource,
} from "../ressources/classRessources.ts";
import Switch from "react-switch";

import type { VSCodeAPIWrapper } from "../api/vscodeAPI.ts";
import ObjectViewComponent from "./ObjectViewComponet.tsx";
import DirectorySettingsComponent from "./DirectorySettingsComponent.tsx";
import FunctionViewComponent from "./FunctionViewComponent.tsx";

export type TsCodeCheckResource = {
  isValid: boolean;
  errors: string[];
};

function LandingPage({ vscode }: { vscode: VSCodeAPIWrapper }) {
  // * View Mode -> react switch select
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [viewMode, setViewMode] = useState<"object" | "function">("object");

  // * Enstprechende Card Componets
  // ? Object-View
  const [classes, setClasses] = useState<ClassResource[]>([]);
  const [instances, setInstance] = useState<InstanceResource[]>([]);

  // ? Function-View
  const [functions, setFunctions] = useState<FunctionResource[]>([]);

  // * Instace stuff
  //hier werden die vom frontend angelegten instances vorübergehend abgelegt, bis bestätigung vom Backend kommt das Instanz erstellt werden konnte
  const instanceWaitingMap = useRef(new Map<string, InstanceResource>([]));
  //hier werden entsprechende methoden rückgaben vom Backend abgelegt
  // ? Map<instanceName, <MethodeName.METHODETYPE, result>[]>
  const [methodResults, setMethodResults] = useState<
    Map<string, Record<string, Error | string>>
  >(new Map([]));
  //Set von Namen instances um sicherzustellen das name uniqe
  const instanceNameSet = useRef(new Set<string>([]));

  //hier entsprechende instances als param übergabe
  // ? Map<className, instances[]>
  const instancesAsParamsMap = useRef<Map<string, string[]>>(new Map([]));

  // * File stuff
  const testedTsFileMap = useRef(new Map<string, TsCodeCheckResource>([]));

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //wenn Webview ready hole alle KLassen
  useEffect(() => {
    vscode.postMessage({
      command: "getAllTsClasses",
    });
    vscode.postMessage({
      command: "getAllTsFunctions",
    });
  }, []);

  //
  const reLoad = (type: "classes" | "functions") => {
    setLoading(true);
    vscode.postMessage({
      command: type === "classes" ? "getAllTsClasses" : "getAllTsFunctions",
    });
  };

  //api - alle erhaltenen messages vom backend
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      const data = message.data;
      console.log(`Recived message with command: ${message.command}`);

      switch (message.command) {
        case "postAllClasses":
          handelPostAllClasses(data);
          break;
        case "postAllFunctions":
          handelPostAllFunctions(data);
          break;
        case "postInstanceCheck":
          handelPostInstanceCheck(data);
          break;
        case "postMethodCheck":
          handelPostMethodCheck(data);
          break;
        case "postTsCodeCheckMap":
          handelPostTsCodeCheckMap(data);
          break;
        case "error":
          setError(message.error);
          setLoading(false);
          break;
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      console.log("Removing message event listener");
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // ? Message handler ----------------------------

  function handelPostAllClasses(data: ClassResource[]) {
    console.log(
      `Massage from command has data: ${JSON.stringify(data, null, 2)}`
    );

    setClasses(data);
    console.log("Received postAllClasses, length:", data);
    data.map((cls: ClassResource) =>
      console.log("Class names:", cls.className)
    );

    setLoading(false);
  }

  function handelPostAllFunctions(data: FunctionResource[]) {
    console.log(
      `Massage from command has data: ${JSON.stringify(data, null, 2)}`
    );

    setFunctions(data);
    console.log("Received postAllClasses, length:", data);
    data.map((foo: FunctionResource) =>
      console.log("Class names:", foo.functionName)
    );

    setLoading(false);
  }

  function handelPostInstanceCheck(data: InstanceCheckResource) {
    console.log(`Massage from command has InstanceCheckRessource: ${data}`);

    const myInstance: InstanceResource | undefined =
      instanceWaitingMap.current.get(data.instanceName);
    if (!myInstance) {
      console.log(`Instance with name: ${data.instanceName} was not found`);
    }
    instanceWaitingMap.current.delete(data.instanceName);

    //füge props hinzu
    myInstance!.props = data.props;

    if (data.isValid && myInstance) {
      setInstance((ins) => [...ins, myInstance]);

      //füge als value hinzu
      const myMapValue: string[] | undefined = instancesAsParamsMap.current.get(
        myInstance.className
      );
      if (!myMapValue) {
        //wenn klasse noch nicht exestiert füge hinzu
        instancesAsParamsMap.current.set(myInstance.className, [
          myInstance.instanceName,
        ]);
      } else {
        //sonst push value
        myMapValue!.push(myInstance.instanceName);
        instancesAsParamsMap.current.set(myInstance.className, myMapValue);
      }
    } else {
      //gebe wieder namen frei und throw error
      instanceNameSet.current.delete(data.instanceName);
      throw Error();
    }
  }

  function handelPostMethodCheck(data: CompiledRunMethodInInstanceTyp) {
    console.log(
      `Massage from command has CompiledRunMethodInInstanceTyp: `,
      JSON.stringify(data, null, 2)
    );

    //setzte rückgabe an richtige steller
    setMethodResults((prev) => {
      const newMap = new Map(prev);

      const methodResultRecord = newMap.get(data.instanceName) ?? {};

      console.log(
        `Setting method return at ${data.methodName}.${data.methodKind}`
      );
      //da es dopplungen geben kann vom method (get, set, default) namen speichere ich die results unter MethodName.MethodeType ab
      methodResultRecord[`${data.methodName}.${data.methodKind}`] = data.isValid
        ? data.returnValue!
        : data.error!;

      newMap.set(data.instanceName, methodResultRecord);
      return newMap;
    });
    console.log("methodResults: ", methodResults);

    //überschreibe bei bedarf instance props
    if (data.newProps) {
      setInstance((prevInstances) => {
        const updatedInstances = prevInstances.map((ins) =>
          ins.instanceName === data.instanceName
            ? { ...ins, props: data.newProps }
            : ins
        );

        const foundInstance = prevInstances.find(
          (ins) => ins.instanceName === data.instanceName
        );

        if (!foundInstance) {
          console.error(
            `Instance ${data.instanceName} was not found to give new props to`
          );
          return prevInstances;
        }

        return updatedInstances;
      });
    }
  }

  function handelPostTsCodeCheckMap(data: Map<string, TsCodeCheckResource>) {
    testedTsFileMap.current = data;
  }

  // ? ----------------------------

  const addToInstanceWaitingList = (instance: InstanceResource) => {
    instanceWaitingMap.current.set(instance.instanceName, instance);
  };

  function dropInstance(insName: string) {
    try {
      instanceNameSet.current.delete(insName);

      setInstance((prev) => {
        const found = prev.find((ins) => ins.instanceName === insName);
        if (!found) {
          console.error("Something went wrong deleting in instances");
          return prev;
        }
        return prev.filter((ins) => ins.instanceName !== insName);
      });
    } catch {
      console.error("Something went wrong deleting");
    }
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      {/* Directory settings */}
      <div className="mb-3">
        <DirectorySettingsComponent
          vscode={vscode}
        ></DirectorySettingsComponent>
      </div>

      {/* View settings */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <span
          className={`fw-bold ${
            viewMode === "object" ? "text-primary" : "text-muted"
          }`}
        >
          Object
        </span>
        <Switch
          onChange={() =>
            setViewMode(viewMode === "object" ? "function" : "object")
          }
          checked={viewMode === "function"}
          onColor="#007bff"
          onHandleColor="#ffffff"
          handleDiameter={24}
          uncheckedIcon={false}
          checkedIcon={false}
          boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
          activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
          height={20}
          width={48}
        />
        <span
          className={`fw-bold ${
            viewMode === "function" ? "text-primary" : "text-muted"
          }`}
        >
          Function
        </span>
      </div>
      {/* View  */}
      {viewMode === "object" ? (
        <div>
          <ObjectViewComponent
            classes={classes}
            instances={instances}
            loading={loading}
            methodResults={methodResults}
            instanceNameSet={instanceNameSet}
            instancesAsParamsMap={instancesAsParamsMap}
            reLoad={reLoad}
            addToInstanceWaitingList={addToInstanceWaitingList}
            dropInstance={dropInstance}
            testedTsFileMap={testedTsFileMap}
            vscode={vscode}
          ></ObjectViewComponent>
        </div>
      ) : (
        <div>
          <FunctionViewComponent
            functions={functions}
            loading={loading}
            reLoad={reLoad}
            // testedTsFileMap={testedTsFileMap}
            //  vscode={vscode}
          ></FunctionViewComponent>
        </div>
      )}
    </>
  );
}

export default LandingPage;
