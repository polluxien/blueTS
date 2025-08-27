import { Button, Col, Container, Row } from "react-bootstrap";
import { ArrowClockwise } from "react-bootstrap-icons";
import type {
  FunctionResource,
  TsCodeCheckResource,
} from "../ressources/classRessources";
import LoadingComponent from "./LoadingComponent";
import FunctionCardComponent from "./functionComponenets/functionCardComponent";
import type { VSCodeAPIWrapper } from "../api/vscodeAPI";
import { getColumnSizes } from "../helper/uiHelper";

type FunctionViewComponentProps = {
  functions: FunctionResource[];
  loading: boolean;

  reLoad: (type: "classes" | "functions") => void;

  functionResults: Map<string, string | Error> | undefined;

  testedTsFileMap: Map<string, TsCodeCheckResource>;
  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;

  vscode: VSCodeAPIWrapper;
};

function FunctionViewComponent({
  functions,
  functionResults,
  loading,
  reLoad,
  testedTsFileMap,
  instancesAsParamsMap,
  vscode,
}: FunctionViewComponentProps) {
  const reLoadFunctions = () => reLoad("functions");
  const functionResultKey = (funcName: string, tsFilePath: string) => {
    return functionResults?.get(`${funcName}_${tsFilePath}`);
  };

  const getTsCodeValidation = (tsFilePath: string) => {
    return testedTsFileMap.get(tsFilePath);
  };

  return (
    <div className="mb-2">
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="m-0">TS-Functions</h1>
          <Button
            onClick={reLoadFunctions}
            style={{
              background: "none",
              border: "none",
              color: "black",
              fontSize: "2rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            aria-label="Refresh"
            title="Reload all functions"
          >
            <ArrowClockwise />
          </Button>
        </div>
      </div>
      <div>
        {!loading ? (
          <Container fluid className="px-0">
            <Row className="g-4">
              {functions.map((foo, index) => (
                <Col key={index} {...getColumnSizes(functions.length)}>
                  <FunctionCardComponent
                    func={foo}
                    functionResult={functionResultKey(
                      foo.functionName,
                      foo.tsFile.path
                    )}
                    tsCodeValidation={getTsCodeValidation(foo.tsFile.path)}
                    vscode={vscode}
                    instancesAsParamsMap={instancesAsParamsMap}
                  ></FunctionCardComponent>
                </Col>
              ))}
            </Row>
          </Container>
        ) : (
          <LoadingComponent compPart="functions"></LoadingComponent>
        )}
      </div>
    </div>
  );
}

export default FunctionViewComponent;
