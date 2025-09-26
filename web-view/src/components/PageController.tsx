import { useContext, useEffect, useRef, useState } from "react";

import Switch from "react-switch";

import DirectorySettingsComponent from "./DirectorySettingsComponent.tsx";
import FunctionViewComponent from "./functionComponenets/FunctionViewComponent.tsx";
import ObjectViewComponent from "./objectComponents/ObjectViewComponet.tsx";
import type { DirectoryRespondeType } from "../ressources/response/directoryResponde.ts";
import type { CompiledFunctionResponseTyp } from "../ressources/response/functionResponse.ts";
import type {
  CompiledMethodInInstanceResponseTyp,
  InstanceCheckResponseType,
} from "../ressources/response/objectResponse.ts";
import type {
  ClassResource,
  FunctionResource,
} from "../ressources/backend/tsCompilerAPIResources.ts";
import type { TsCodeCheckResource } from "../ressources/classRessources.ts";
import type { RefreshedResponseType } from "../ressources/response/fileCheckResponse.ts";
import type { InstanceResource } from "../ressources/frontend/instanceTypes.ts";
import { VscodeContext } from "../api/vscodeAPIContext.ts";
import ConsoleLogComponent from "./ConsoleLogComponent.tsx";
import { Col, Row } from "react-bootstrap";

function PageController() {
  const vscode = useContext(VscodeContext);

  // * View Mode -> react switch select
  const [viewMode, setViewMode] = useState<"object" | "function">("object");

  // * Enstprechende Card Componets

  // * Object-View

  // ? Map<filePath, ClassResource[]>
  const [classes, setClasses] = useState<Map<string, ClassResource[]>>(
    new Map()
  );
  const [instances, setInstance] = useState<InstanceResource[]>([]);

  // * Function-View

  //? Map<filePath, ClassResource[]>
  const [functions, setFunctions] = useState<Map<string, FunctionResource[]>>(
    new Map()
  );

  // ? Directory-Componet
  const [currentDirectoryRes, setCurrentDirectoryRes] =
    useState<DirectoryRespondeType>();

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
  const [testedTsFileMap, setTestedTsFileMap] = useState(
    new Map<string, TsCodeCheckResource>([])
  );

  // * Function stuff
  // für function View -> Results
  // ? Map<functionName, result>
  const [functionResultsMap, setFunctionResultsMap] = useState<
    Map<string, string | Error>
  >(new Map());

  // * Compied Code Logs
  const [logsAsStringArr, setLogsAsStringArr] = useState<string[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //wenn Webview ready hole alle Klassen, Functions, CodeChecks und aktuelle Directory Informationen
  useEffect(() => {
    vscode.postMessage([
      //checke ob alle TS-Files korrekt
      { command: "getAllTsFileChecks" },
      //holle alle KLassen
      {
        command: "getAllTsClasses",
      },
      //holle alle Funktionen
      {
        command: "getAllTsFunctions",
      },
      //holle aktuelle directory
      {
        command: "getCurrentDirectory",
      },
    ]);
  }, []);

  //
  const reLoad = (type: "classes" | "functions") => {
    setLoading(true);
    vscode.postMessage([
      //aktualisiere und hole neue klassen / Funktionen
      {
        command: type === "classes" ? "getAllTsClasses" : "getAllTsFunctions",
      },
      //checke Files erneut
      {
        command: "getAllTsFileChecks",
      },
    ]);
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
        case "postFunctionCheck":
          handelPostFunctionCheck(data);
          break;
        case "postTsCodeCheckMap":
          handelPostTsCodeCheckMap(data);
          break;
        case "postRefreshFileData":
          handelPostRefreshFileData(data);
          break;
        case "postCurrentDirectoryRes":
          handelCurrentDirectoryRes(data);
          break;

        //Backend-Event-Driven
        case "deleteTsCodeCheck":
          handelDeleteTSCodeCheck(data);
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
    //setClasses(new Map(data.map((cls) => [cls.tsFile.path, [cls]])));

    console.log(
      `Massage from command has data: ${JSON.stringify(data, null, 2)}`
    );

    setClasses(() => {
      const newMap = new Map<string, ClassResource[]>();

      for (const cls of data) {
        const path = cls.tsFile.path;

        // nach existierende Klassen für diesen Pfad prüfen
        const map = newMap.get(path) ?? [];

        // neue Klasse hinzufügen
        newMap.set(path, [...map, cls]);
      }

      return newMap;
    });

    setLoading(false);
  }

  function handelPostAllFunctions(data: FunctionResource[]) {
    console.log(
      `Massage from command has data: ${JSON.stringify(data, null, 2)}`
    );

    setFunctions(() => {
      const newMap = new Map<string, FunctionResource[]>();

      for (const func of data) {
        const path = func.tsFile.path;

        // nach existierende Functions für diesen Pfad prüfen
        const map = newMap.get(path) ?? [];

        // neue Klasse hinzufügen
        newMap.set(path, [...map, func]);
      }

      return newMap;
    });
    console.log("Received postAllClasses, length:", data);
    data.map((foo: FunctionResource) =>
      console.log("Class names:", foo.functionName)
    );

    setLoading(false);
  }

  function handelPostInstanceCheck(data: InstanceCheckResponseType) {
    console.log(`Massage from command has InstanceCheckRessource: ${data}`);

    const myInstance: InstanceResource | undefined =
      instanceWaitingMap.current.get(data.instanceName);
    if (!myInstance) {
      console.log(`Instance with name: ${data.instanceName} was not found`);
    }
    instanceWaitingMap.current.delete(data.instanceName);

    if (data.logs && data.logs.length > 0) {
      setLogsAsStringArr((prev) => [...prev, ...data.logs!]);
    }

    //füge props hinzu
    myInstance!.compiledProperties = data.props;

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

  function handelPostMethodCheck(data: CompiledMethodInInstanceResponseTyp) {
    console.log(
      `Massage from command has CompiledRunMethodInInstanceTyp: `,
      JSON.stringify(data, null, 2)
    );

    if (data.logs && data.logs.length > 0) {
      setLogsAsStringArr((prev) => [...prev, ...data.logs!]);
    }

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
            ? { ...ins, compiledProperties: data.newProps }
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

  function handelPostFunctionCheck(data: CompiledFunctionResponseTyp) {
    const myKey = `${data.functionName}_${data.tsFile.path}`;

    if (data.logs && data.logs.length > 0) {
      setLogsAsStringArr((prev) => [...prev, ...data.logs!]);
    }

    setFunctionResultsMap((prev) => {
      const myMap = new Map(prev);
      myMap.set(myKey, data.isValid ? data.returnValue! : data.error!);
      return myMap;
    });
  }

  function handelPostTsCodeCheckMap(data: [string, TsCodeCheckResource][]) {
    const myTsCodeCheckMap = new Map(data);
    setTestedTsFileMap(myTsCodeCheckMap);
  }

  function handelPostRefreshFileData(data: RefreshedResponseType) {
    console.log(
      `Massage from command has data: ${JSON.stringify(data, null, 2)}`
    );

    setTestedTsFileMap((prev) => {
      const newMap = new Map(prev);
      newMap.set(data.tsFilePath, data.tsFileCheck);
      return newMap;
    });

    setFunctions((prev) => {
      const newMap = new Map(prev);
      newMap.set(data.tsFilePath, data.refreshedFunctions);
      return newMap;
    });

    setClasses((prev) => {
      const newMap = new Map(prev);
      newMap.set(data.tsFilePath, data.refreshedClasses);
      return newMap;
    });
  }

  function handelDeleteTSCodeCheck(data: string) {
    setTestedTsFileMap((prev) => {
      const newMap = new Map(prev);
      newMap.delete(data);
      return newMap;
    });
  }

  function handelCurrentDirectoryRes(data: DirectoryRespondeType) {
    setCurrentDirectoryRes(data);
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

  const getClasses = () => Array.from(classes.values()).flat();
  const getFunctions = () => Array.from(functions.values()).flat();

  return (
    <div style={{ width: "100%" }}>
      {/* Directory settings */}
      <div className="mb-3 mt-3">
        <DirectorySettingsComponent
          currentDirectoryRes={currentDirectoryRes}
        ></DirectorySettingsComponent>
      </div>

      {/* View settings */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <span
          className={`fw-bold ${
            viewMode === "object" ? "text-dark" : "text-muted"
          }`}
        >
          Object
        </span>
        {/* React-Switch Example inspo --> https://react-switch.netlify.app*/}
        <Switch
          onChange={() =>
            setViewMode(viewMode === "object" ? "function" : "object")
          }
          checked={viewMode === "function"}
          onColor="#C7751D"
          offColor="#304674"
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
            viewMode === "function" ? "text-dark" : "text-muted"
          }`}
        >
          Function
        </span>
      </div>

      {/* Views */}
      <div style={{ paddingBottom: "30vh" }}>
        {viewMode === "object" ? (
          <ObjectViewComponent
            classes={getClasses()}
            instances={instances}
            loading={loading}
            methodResults={methodResults}
            instanceNameSet={instanceNameSet}
            instancesAsParamsMap={instancesAsParamsMap}
            reLoad={reLoad}
            addToInstanceWaitingList={addToInstanceWaitingList}
            dropInstance={dropInstance}
            testedTsFileMap={testedTsFileMap}
          ></ObjectViewComponent>
        ) : (
          <FunctionViewComponent
            functions={getFunctions()}
            functionResults={functionResultsMap}
            loading={loading}
            reLoad={reLoad}
            testedTsFileMap={testedTsFileMap}
            instancesAsParamsMap={instancesAsParamsMap}
          ></FunctionViewComponent>
        )}
      </div>

      {/* Konsolenausgabe */}
      <div
        className="fixed-bottom border-top bg-white"
        style={{ height: "24vh" }}
      >
        <div className="container-fluid h-100">
          <Row className="h-100">
            <Col xs={12}>
              <ConsoleLogComponent logsAsStringArr={logsAsStringArr} />
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default PageController;
