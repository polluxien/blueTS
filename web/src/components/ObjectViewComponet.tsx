import { Button, Col, Container, Row } from "react-bootstrap";
import { ArrowClockwise } from "react-bootstrap-icons";
import ClassCardComponent from "./classComponents/ClassCardComponent.tsx";
import InstanceCardComponent from "./instanceComponents/InstanceCardComponent.tsx";
import type { VSCodeAPIWrapper } from "../api/vscodeAPI";
import type {
  ClassRessource,
  InstanceRessource,
} from "../ressources/classRessources";

type ObjectViewComponentProps = {
  classes: ClassRessource[];
  instances: InstanceRessource[];
  loading: boolean;
  methodResults: Map<string, Record<string, Error | string>>;

  instanceNameSet: React.RefObject<Set<string>>;
  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;

  refreshClasses: () => void;
  addToInstanceWaitingList: (instance: InstanceRessource) => void;

  vscode: VSCodeAPIWrapper;
};

function ObjectViewComponent({
  classes,
  instances,
  loading,
  methodResults,
  instanceNameSet,
  instancesAsParamsMap,
  refreshClasses,
  addToInstanceWaitingList,
  vscode,
}: ObjectViewComponentProps) {
  return (
    <>
      <div className="mb-2">
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

export default ObjectViewComponent;
