import { useEffect, useRef, useState } from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import type {
  ClassRessource,
  InstanceRessource,
} from "../ressources/classRessources.ts";
import ClassCardComponent from "./classComponents/classCardComponent.tsx";
import { Container } from "react-bootstrap";

import { vscode } from "../api/vscodeAPI.ts";

function LandingPage() {
  const [classes, setClasses] = useState<ClassRessource[]>([]);
  //const [instances, setInstance] = useState<InstanceRessource[]>([]);

  //hier werden die vom frontend angelegten instances vorübergehend abgelegt, bis bestätigung vom Backend kommt das Instanz erstellt werden konnte
  const instanceWaitingMap = useRef(new Map<string, InstanceRessource>([]));

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    vscode.postMessage({
      command: "webViewReady",
    });
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log(`Recived message with command: ${message.command}`);

      switch (message.command) {
        case "postClasses":
          console.log(`Massage from command has data: ${message.data}`);
          setClasses(message.data);
          console.log("classes var: ", classes);
          setLoading(false);
          break;
        case "postInstanceCheck": {
          console.log(`Massage from instanceCheck has data: ${message.data}`);
          const myInstance: InstanceRessource | undefined =
            instanceWaitingMap.current.get(message.data.instanceName);
          if (!myInstance) {
            console.log(
              `Instance with name: ${message.data.instanceName} was not found`
            );
          }
          instanceWaitingMap.current.delete(message.data.instanceName);
          if (message.data.isValid) {
            //setInstance((ins) => [...(ins + myInstance)]);
          } else {
            throw Error();
          }
          console.log("classes var: ", classes);
          setLoading(false);
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
          <h1>ts-Classes</h1>
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
              {/* instances.map((ins, index) => (
                <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <ClassCardComponent cls={ins} />
                </Col>
              )) */}
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
}

export default LandingPage;
