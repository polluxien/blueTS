import { Alert, Button, Col, Container, Row } from "react-bootstrap";
import { ArrowClockwise } from "react-bootstrap-icons";
import InstanceCardComponent from "./instanceComponents/InstanceCardComponent.tsx";
import type { VSCodeAPIWrapper } from "../api/vscodeAPI.ts";
import type {
  ClassResource,
  InstanceResource,
  TsCodeCheckResource,
} from "../ressources/classRessources.ts";
import LoadingComponent from "./LoadingComponent.tsx";
import ClassCardComponent from "./classComponents/classCardComponent.tsx";
import { getColumnSizes } from "../helper/uiHelper.ts";

type ObjectViewComponentProps = {
  classes: ClassResource[];
  instances: InstanceResource[];
  testedTsFileMap: Map<string, TsCodeCheckResource>;

  loading: boolean;
  methodResults: Map<string, Record<string, Error | string>>;

  instanceNameSet: React.RefObject<Set<string>>;
  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;

  reLoad: (type: "classes" | "functions") => void;
  dropInstance: (insName: string) => void;
  addToInstanceWaitingList: (instance: InstanceResource) => void;

  vscode: VSCodeAPIWrapper;
};

function ObjectViewComponent({
  classes,
  instances,
  loading,
  methodResults,
  instanceNameSet,
  instancesAsParamsMap,
  testedTsFileMap,
  reLoad,
  addToInstanceWaitingList,
  vscode,
  dropInstance,
}: ObjectViewComponentProps) {
  const reLoadClasses = () => reLoad("classes");
  const getTsCodeValidation = (tsFilePath: string) => {
    return testedTsFileMap.get(tsFilePath);
  };

  return (
    <>
      <div className="mb-2">
        {/* Hier werden die gefunden TS-Klassen gezeigt*/}
        <div className="w-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="m-0">TS-Classes</h1>
            <Button
              onClick={reLoadClasses}
              style={{
                background: "none",
                border: "none",
                color: "black",
                fontSize: "2rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              aria-label="Refresh"
              title="Reload all classes"
            >
              <ArrowClockwise />
            </Button>
          </div>
          <div className="mb-4">
            {!loading ? (
              <Container fluid className="px-0">
                {" "}
                <Row className="g-4">
                  {classes.length > 0 ? (
                    classes.map((cls, index) => (
                      <Col key={index} {...getColumnSizes(classes.length)}>
                        <ClassCardComponent
                          cls={cls}
                          addToInstanceWaitingList={addToInstanceWaitingList}
                          instanceNameSet={instanceNameSet}
                          instancesAsParamsMap={instancesAsParamsMap}
                          tsCodeValidation={getTsCodeValidation(
                            cls.tsFile.path
                          )}
                          vscode={vscode}
                        />
                      </Col>
                    ))
                  ) : (
                    <div className="mb-4">
                      <Alert variant="light">
                        <h5 className="text-muted mb-2">
                          No <strong>classes</strong> found in current directory
                        </h5>
                        <p className="text-muted mb-0">
                          Create a TypeScript class in your current working
                          directory or switch to a different directory and click{" "}
                          <ArrowClockwise className="mx-1" /> to refresh
                        </p>
                      </Alert>
                    </div>
                  )}
                </Row>
              </Container>
            ) : (
              <LoadingComponent compPart="classes"></LoadingComponent>
            )}
          </div>
        </div>
        {/* Hier werden die erstellten Klassen-Instances angezeigt*/}
        {classes.length > 0 && (
          //zeige überhaup erst an wenn mindestens eine Klasse verfügbar ist
          <div className="mb-4">
            <h1>Class-Instances</h1>
            <Container fluid className="px-0">
              <Row className="g-4">
                {instances.length > 0 ? (
                  instances.map((ins, index) => (
                    //hier auch auf größe von classes anapassen
                    <Col key={index} {...getColumnSizes(classes.length)}>
                      <InstanceCardComponent
                        ins={ins}
                        vscode={vscode}
                        methodResults={methodResults.get(ins.instanceName)}
                        dropInstance={dropInstance}
                        instancesAsParamsMap={instancesAsParamsMap}
                      />
                    </Col>
                  ))
                ) : (
                  <div className="mb-4">
                    <Alert variant="light">
                      <h5 className="text-muted mb-2">
                        No instances created yet
                      </h5>
                      <p className="text-muted mb-0">
                        Click the <strong>"Add Instance"</strong> button on any
                        class above to create your first instance
                      </p>
                    </Alert>
                  </div>
                )}
              </Row>
            </Container>
          </div>
        )}
      </div>
    </>
  );
}

export default ObjectViewComponent;
