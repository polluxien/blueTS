import { useEffect, useState } from "react";
import { vscode } from "../api/vscodeAPI";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import type { ClassRessource } from "../ressources/classRessources";
import ClassCardComponent from "./classComponents/classCardComponent.tsx";
import { Container } from "react-bootstrap";

function ClassPage() {
  const [classes, setClasses] = useState<ClassRessource[]>([]);
  //const [instances, setInstance] = useState<Record<string, string>[]>();

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

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div>
        {/* Hier werden die gefunden TS-Klassen gezeigt*/}
        <div>
          <h1>ts-Classes</h1>
          <Container>
            <Row>
              {classes.map((cls, index) => (
                <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <ClassCardComponent cls={cls} />
                </Col>
              ))}
            </Row>
          </Container>
        </div>
        {/* Hier werden die erstellten Klassen-Instances angezeigt*/}
        <div>
          <h1>Class-Instances</h1>
          <Container>
            <Row>
              {classes.map((ins, index) => (
                <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <ClassCardComponent cls={ins} />
                </Col>
              ))}
            </Row>
          </Container>
        </div>
      </div>
    </>
  );
}

export default ClassPage;
