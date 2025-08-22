import type {
  ClassResource,
  InstanceResource,
  TsCodeCheckResource,
} from "../../ressources/classRessources.ts";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useEffect, useState } from "react";
import type { VSCodeAPIWrapper } from "../../api/vscodeAPI.ts";
import CreateClassInstanceDialogComponent from "./CreateClassInstanceDialogComponent.tsx";
import { Col, Row } from "react-bootstrap";

//Bootstrap Icons
import { PlayFill, Plus, QuestionCircle } from "react-bootstrap-icons"; // Bootstrap Icons
import CompilerErrorModalComponent from "./CompilerErrorModalComponent.tsx";

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
  }, [tsCodeValidation]);

  // const [hoveredAdd, setHoveredAdd] = useState(false);
  // const [hoveredRun, setHoveredRun] = useState(false);

  const openclassDialog = () => setClassDialogOpen(true);
  const closeclassDialog = () => setClassDialogOpen(false);

  const openErrorDialog = () => setErrorDialogOpen(true);
  const closeErrorDialog = () => setErrorDialogOpen(false);

  const sendTsPathForTsCodeChecking = () => {
    // ! funktioniert nicht -> ziel refresh class neue classRessource anfordern und neue CheckRessource
    const message = { message: "refreshClass", data: cls.tsFile.path };
    console.log("check pressed sending message: ", message);

    vscode.postMessage([message]);
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
          {tsCodeValidation && !isValid && (
            <Button variant="danger" size="sm" onClick={openErrorDialog}>
              <QuestionCircle />
            </Button>
          )}
          <Card.Title>{cls.className}</Card.Title>
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
                onClick={sendTsPathForTsCodeChecking}
              >
                <>
                  <PlayFill className="me-2" />
                  refresh class
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
