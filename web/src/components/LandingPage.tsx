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
  //Map<instanceName, <MethodeName, result>[]>
  const [methodResults, setMethodResults] = useState<
    Map<string, Record<string, Error | string>>
  >(new Map([]));
  //Set von Namen instances um sicherzustellen das name uniqe
  const instanceNameSet = useRef(new Set<string>([]));

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
          console.log(
            `Massage from command has data: ${JSON.stringify(
              message.data,
              null,
              2
            )}`
          );

          setClasses(message.data);
          console.log("Received postAllClasses, length:", message.data.length);
          message.data.map((cls: ClassRessource) =>
            console.log("Class names:", cls.className)
          );

          setLoading(false);
          break;
        case "postInstanceCheck": {
          const messageData: InstanceCheckRessource = message.data;
          console.log(
            `Massage from command has InstanceCheckRessource: ${messageData}`
          );

          const myInstance: InstanceRessource | undefined =
            instanceWaitingMap.current.get(messageData.instanceName);
          if (!myInstance) {
            console.log(
              `Instance with name: ${messageData.instanceName} was not found`
            );
          }
          instanceWaitingMap.current.delete(messageData.instanceName);

          if (messageData.isValid && myInstance) {
            setInstance((ins) => [...ins, myInstance]);
          } else {
            //gebe wieder namen frei und throw error
            instanceNameSet.current.delete(messageData.instanceName);
            throw Error();
          }
          break;
        }
        case "postMethodCheck": {
          const messageData: CompiledRunMethodInInstanceTyp = message.data;
          console.log(
            `Massage from command has CompiledRunMethodInInstanceTyp: `,
            JSON.stringify(messageData, null, 2)
          );

          setMethodResults((prev) => {
            const newMap = new Map(prev);

            const methodResultRecord =
              newMap.get(messageData.instanceName) ?? {};

            methodResultRecord[messageData.methodName] = messageData.isValid
              ? messageData.returnValue!
              : messageData.error!;

            newMap.set(messageData.instanceName, methodResultRecord);

            return newMap;
          });
          console.log("methodResults: ", methodResults);
          break;
        }
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
