import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useContext, useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

//Bootstrap Icons
import { PlayFill, Plus, QuestionCircle } from "react-bootstrap-icons"; // Bootstrap Icons
import CompilerErrorModalComponent from "../errorComponents/CompilerErrorModalComponent.tsx";
import type { FunctionResource } from "../../ressources/backend/tsCompilerAPIResources.ts";
import FunctionRunFunctionDialogComponent from "./FunctionRunFunctionDialogComponent.tsx";
import type { TsCodeCheckResource } from "../../ressources/classRessources.ts";
import { VscodeContext } from "../../api/vscodeAPIContext.ts";

type FunctionCardComponentProps = {
  func: FunctionResource;
  tsCodeValidation: TsCodeCheckResource | undefined;

  functionResult: string | Error | undefined;
  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;
};

function FunctionCardComponent({
  func,
  functionResult,
  tsCodeValidation,
  instancesAsParamsMap,
}: FunctionCardComponentProps) {
  const vscode = useContext(VscodeContext);

  const [functionDialogOpen, setFunctionDialogOpen] = useState<boolean>(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState<boolean>(false);

  const [isValid, setIsValid] = useState(tsCodeValidation?.isValid ?? false);

  useEffect(() => {
    setIsValid(tsCodeValidation?.isValid ?? false);

    if (functionDialogOpen) {
      setFunctionDialogOpen(false);
    }
  }, [tsCodeValidation]);

  const openFunctionDialog = () => setFunctionDialogOpen(true);
  const closeFunctionDialog = () => setFunctionDialogOpen(false);

  const openErrorDialog = () => setErrorDialogOpen(true);
  const closeErrorDialog = () => setErrorDialogOpen(false);

  const refreshFile = () => {
    console.log("check pressed sending message: ", func.tsFile.path);
    vscode.postMessage([{ command: "refreshFile", data: func.tsFile }]);
  };

  return (
    <>
      <Card
        text="white"
        className="h-100 shadow-sm"
        style={{
          //width: "280px",
          background: "#C7751D",
          borderRadius: "16px",
          border: "none",
          width: "100%",
          position: "relative",
        }}
      >
        <Card.Body>
          <Card.Title>
            {func.functionName}{" "}
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
            background: "#945613",
          }}
        >
          file: <i>{func.tsFile?.name}</i>
        </Card.Footer>
      </Card>
      {functionDialogOpen && (
        <FunctionRunFunctionDialogComponent
          func={func}
          functionResult={functionResult}
          instancesAsParamsMap={instancesAsParamsMap}
          close={closeFunctionDialog}
        ></FunctionRunFunctionDialogComponent>
      )}
      {errorDialogOpen && tsCodeValidation && !isValid && (
        <CompilerErrorModalComponent
          close={closeErrorDialog}
          tsFile={func.tsFile}
          compilerErrs={tsCodeValidation.errors}
        ></CompilerErrorModalComponent>
      )}
    </>
  );
}

export default FunctionCardComponent;
