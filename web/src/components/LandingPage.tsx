import { useEffect, useRef, useState } from "react";
import type {
  ClassRessource,
  CompiledRunMethodInInstanceTyp,
  InstanceCheckRessource,
  InstanceRessource,
} from "../ressources/classRessources.ts";
import Switch from "react-switch";

//Icons
import type { VSCodeAPIWrapper } from "../api/vscodeAPI.ts";
import ObjectViewComponent from "./ObjectViewComponet.tsx";
import DirectorySettingsComponent from "./DirectorySettingsComponent.tsx";

function LandingPage({ vscode }: { vscode: VSCodeAPIWrapper }) {
  // * View Mode -> react switch select
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [viewMode, setViewMode] = useState<"object" | "function">("object");

  // * Enstprechende Card Componets
  const [classes, setClasses] = useState<ClassRessource[]>([]);
  const [instances, setInstance] = useState<InstanceRessource[]>([]);

  // * Instace stuff
  //hier werden die vom frontend angelegten instances vorübergehend abgelegt, bis bestätigung vom Backend kommt das Instanz erstellt werden konnte
  const instanceWaitingMap = useRef(new Map<string, InstanceRessource>([]));
  //hier werden entsprechende methoden rückgaben vom Backend abgelegt
  // ? Map<instanceName, <MethodeName, result>[]>
  const [methodResults, setMethodResults] = useState<
    Map<string, Record<string, Error | string>>
  >(new Map([]));
  //Set von Namen instances um sicherzustellen das name uniqe
  const instanceNameSet = useRef(new Set<string>([]));

  //hier entsprechende instances als param übergabe
  // ? Map<className, instances[]>
  const instancesAsParamsMap = useRef<Map<string, string[]>>(new Map([]));

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //wenn Webview ready hole alle KLassen
  useEffect(() => {
    vscode.postMessage({
      command: "getAllTsClasses",
    });
  }, []);

  //
  const refreshClasses = () => {
    setLoading(true);
    vscode.postMessage({
      command: "getAllTsClasses",
    });
  };

  //api - alle erhaltenen messages vom backend
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log(`Recived message with command: ${message.command}`);

      switch (message.command) {
        case "postAllClasses":
          handelPostAllClasses(message.data);
          break;
        case "postInstanceCheck":
          handelPostInstanceCheck(message.data);
          break;
        case "postMethodCheck":
          handelpostMethodCheck(message.data);
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

  function handelPostAllClasses(data: ClassRessource[]) {
    console.log(
      `Massage from command has data: ${JSON.stringify(data, null, 2)}`
    );

    setClasses(data);
    console.log("Received postAllClasses, length:", data);
    data.map((cls: ClassRessource) =>
      console.log("Class names:", cls.className)
    );

    setLoading(false);
  }

  function handelPostInstanceCheck(data: InstanceCheckRessource) {
    console.log(`Massage from command has InstanceCheckRessource: ${data}`);

    const myInstance: InstanceRessource | undefined =
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

  function handelpostMethodCheck(data: CompiledRunMethodInInstanceTyp) {
    console.log(
      `Massage from command has CompiledRunMethodInInstanceTyp: `,
      JSON.stringify(data, null, 2)
    );

    //setzte rückgabe an richtige steller
    setMethodResults((prev) => {
      const newMap = new Map(prev);

      const methodResultRecord = newMap.get(data.instanceName) ?? {};

      methodResultRecord[data.methodName] = data.isValid
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

  // ? ----------------------------

  const addToInstanceWaitingList = (instance: InstanceRessource) => {
    instanceWaitingMap.current.set(instance.instanceName, instance);
  };

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
            refreshClasses={refreshClasses}
            addToInstanceWaitingList={addToInstanceWaitingList}
            vscode={vscode}
          ></ObjectViewComponent>
        </div>
      ) : (
        <div>
          <p>Soon to be implementet</p>
        </div>
      )}
    </>
  );
}

export default LandingPage;
