import type {
  FunctionResource,
  TsCodeCheckResource,
} from "../../ressources/classRessources.ts";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useEffect, useState } from "react";
import type { VSCodeAPIWrapper } from "../../api/vscodeAPI.ts";
import { Col, Row } from "react-bootstrap";

//Bootstrap Icons
import { PlayFill, Plus, QuestionCircle } from "react-bootstrap-icons"; // Bootstrap Icons

type FunctionCardComponentProps = {
  func: FunctionResource;
  tsCodeValidation: TsCodeCheckResource | undefined;

  vscode: VSCodeAPIWrapper;
};

function FunctionCardComponent({
  func,
  tsCodeValidation,
  vscode,
}: FunctionCardComponentProps) {
  const [functionDialogOpen, setFunctionDialogOpen] = useState<boolean>(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);

  const [isValid, setIsValid] = useState(tsCodeValidation?.isValid ?? false);

  useEffect(() => {
    setIsValid(tsCodeValidation?.isValid ?? false);
  }, [tsCodeValidation]);

  
  const openFunctionDialog = () => setFunctionDialogOpen(true);
  //const closeFunctionDialog = () => setFunctionDialogOpen(false);

  const openErrorDialog = () => setErrorDialogOpen(true);
  //const closeErrorDialog = () => setErrorDialogOpen(false);

  const sendTsPathForTsCodeChecking = () => {
    // ! funktioniert nicht -> ziel refresh class neue classRessource anfordern und neue CheckRessource
    const message = { message: "refreshClass", data: func.tsFile.path };
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
          background: "#c7751dff",
          borderRadius: "16px",
          border: "none",
          width: "100%",
          position: "relative",
        }}
      >
        <Card.Body>
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
          <Card.Title>{func.functionName}</Card.Title>
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
                onClick={openFunctionDialog}
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
          file: <i>{func.tsFile?.name}</i>
        </Card.Footer>
      </Card>
      {functionDialogOpen &&
        {
          /*       
        <CreateClassInstanceDialogComponent
          cls={cls}
          close={closeclassDialog}
          addToInstanceWaitingList={addToInstanceWaitingList}
          vscode={vscode}
          instanceNameSet={instanceNameSet}
          instancesAsParamsMap={instancesAsParamsMap}
        ></CreateClassInstanceDialogComponent>
        */
        }}
      {errorDialogOpen &&
        tsCodeValidation &&
        !isValid &&
        {
          /*        
          <CompilerErrorModalComponent
          close={closeErrorDialog}
          tsFile={cls.tsFile}
          compilerErrs={tsCodeValidation.errors}
        ></CompilerErrorModalComponent>
        */
        }}
    </>
  );
}

export default FunctionCardComponent;
