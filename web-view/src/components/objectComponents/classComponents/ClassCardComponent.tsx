import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useEffect, useState } from "react";
import type { VSCodeAPIWrapper } from "../../../api/vscodeAPI.ts";
import CreateClassInstanceDialogComponent from "./ClassCreateInstanceDialogComponent.tsx";
import { Col, Row } from "react-bootstrap";

//Bootstrap Icons
import { PlayFill, Plus, QuestionCircle } from "react-bootstrap-icons"; // Bootstrap Icons
import CompilerErrorModalComponent from "../../errorComponents/CompilerErrorModalComponent.tsx";
import type { ClassResource } from "../../../ressources/backend/tsCompilerAPIResources.ts";
import type {
  TsCodeCheckResource,
} from "../../../ressources/classRessources.ts";
import type { InstanceResource } from "../../../ressources/frontend/instanceTypes.ts";

type ClassCardComponentProps = {
  cls: ClassResource;
  tsCodeValidation: TsCodeCheckResource | undefined;

  addToInstanceWaitingList: (instance: InstanceResource) => void;
  vscode: VSCodeAPIWrapper;
  instanceNameSet: React.RefObject<Set<string>>;
  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;
};

function ClassCardComponent({
  cls,
  tsCodeValidation,
  addToInstanceWaitingList,
  vscode,
  instanceNameSet,
  instancesAsParamsMap,
}: ClassCardComponentProps) {
  const [classDialogOpen, setClassDialogOpen] = useState<boolean>(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);

  const [isValid, setIsValid] = useState(tsCodeValidation?.isValid ?? false);

  useEffect(() => {
    setIsValid(tsCodeValidation?.isValid ?? false);

    if (classDialogOpen) {
      setClassDialogOpen(false);
    }
  }, [tsCodeValidation]);

  // const [hoveredAdd, setHoveredAdd] = useState(false);
  // const [hoveredRun, setHoveredRun] = useState(false);

  const openclassDialog = () => setClassDialogOpen(true);
  const closeclassDialog = () => setClassDialogOpen(false);

  const openErrorDialog = () => setErrorDialogOpen(true);
  const closeErrorDialog = () => setErrorDialogOpen(false);

  const refreshFile = () => {
    console.log("check pressed sending message: ", cls.tsFile.path);
    vscode.postMessage([{ command: "refreshFile", data: cls.tsFile }]);
  };

  return (
    <>
      <Card
        text="white"
        className="h-100 shadow-sm"
        style={{
          //width: "280px",
          background: "#304674",
          borderRadius: "16px",
          border: "none",
          width: "100%",
          position: "relative",
        }}
      >
        <Card.Body>
          <Card.Title>
            {cls.className}{" "}
            {tsCodeValidation && !isValid && (
              <Button
                variant="danger"
                size="sm"
                onClick={openErrorDialog}
                title="show compiler Error"
              >
                <QuestionCircle />
              </Button>
            )}
          </Card.Title>
          <Row className="gap-2">
            <Col>
              <Button
                //w-100 = 100% des cols, gap-2 = abstabnd zwischen icon und text
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                variant="outline-light"
                size="sm"
                style={{
                  height: "44px",
                  borderRadius: "12px",
                  // border: "none",
                }}
                //style={baseStyle(hoveredRun)}
                // onMouseEnter={() => setHoveredRun(true)}
                //  onMouseLeave={() => setHoveredRun(false)}
                onClick={refreshFile}
              >
                <>
                  <PlayFill className="me-2" />
                  refresh file
                </>
              </Button>
            </Col>
            <Col>
              <Button
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                variant="outline-light"
                size="sm"
                style={{
                  height: "44px",
                  borderRadius: "12px",
                  //border: "none",
                }}
                disabled={!isValid}
                //style={baseStyle(hoveredAdd)}
                // onMouseEnter={() => setHoveredAdd(true)}
                //  onMouseLeave={() => setHoveredAdd(false)}
                onClick={openclassDialog}
              >
                <>
                  <Plus className="me-2" /> Add Instance
                </>
              </Button>
            </Col>
          </Row>
        </Card.Body>
        <Card.Footer
          style={{
            border: "none",
            borderBottomLeftRadius: "16px",
            borderBottomRightRadius: "16px",
            background: "#26385D",
          }}
        >
          file: <i>{cls.tsFile?.name}</i>
        </Card.Footer>
      </Card>
      {classDialogOpen && (
        <CreateClassInstanceDialogComponent
          cls={cls}
          close={closeclassDialog}
          addToInstanceWaitingList={addToInstanceWaitingList}
          vscode={vscode}
          instanceNameSet={instanceNameSet}
          instancesAsParamsMap={instancesAsParamsMap}
        ></CreateClassInstanceDialogComponent>
      )}
      {errorDialogOpen && tsCodeValidation && !isValid && (
        <CompilerErrorModalComponent
          close={closeErrorDialog}
          tsFile={cls.tsFile}
          compilerErrs={tsCodeValidation.errors}
        ></CompilerErrorModalComponent>
      )}
    </>
  );
}

export default ClassCardComponent;
