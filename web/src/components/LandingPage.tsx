import { useEffect, useRef, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import type {
  ClassRessource,
  CompiledRunMethodInInstanceTyp,
  InstanceCheckRessource,
  InstanceRessource,
} from "../ressources/classRessources.ts";
import { Button, Container } from "react-bootstrap";

import InstanceCardComponent from "./instanceComponents/InstanceCardComponent.tsx";

//Icons
import { ArrowClockwise } from "react-bootstrap-icons";
import type { VSCodeAPIWrapper } from "../api/vscodeAPI.ts";
import ClassCardComponent from "./classComponents/ClassCardComponent.tsx";

function LandingPage({ vscode }: { vscode: VSCodeAPIWrapper }) {
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
      <div>
        {/* Hier werden die gefunden TS-Klassen gezeigt*/}
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="m-0">TS-Classes</h1>
            <Button
              onClick={refreshClasses}
              style={{
                background: "none",
                border: "none",
                color: "black",
                fontSize: "2rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              aria-label="Refresh"
            >
              <ArrowClockwise />
            </Button>
          </div>
          <div>
            {!loading ? (
              <Container>
                <Row>
                  {classes.map((cls, index) => (
                    <Col
                      key={index}
                      xs={12}
                      sm={6}
                      md={4}
                      lg={3}
                      className="mb-4"
                    >
                      <ClassCardComponent
                        cls={cls}
                        addToInstanceWaitingList={addToInstanceWaitingList}
                        instanceNameSet={instanceNameSet}
                        instancesAsParamsMap={instancesAsParamsMap}
                        vscode={vscode}
                      />
                    </Col>
                  ))}
                </Row>
              </Container>
            ) : (
              <div className="loading-container">
                <div>Loading...</div>
              </div>
            )}
          </div>
        </div>
        {/* Hier werden die erstellten Klassen-Instances angezeigt*/}
        <div>
          <h1>Class-Instances</h1>
          <Container>
            <Row>
              {instances.map((ins, index) => (
                <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <InstanceCardComponent
                    ins={ins}
                    vscode={vscode}
                    methodResults={methodResults.get(ins.instanceName)}
                    instancesAsParamsMap={instancesAsParamsMap}
                  />
                </Col>
              ))}
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
}

export default LandingPage;
