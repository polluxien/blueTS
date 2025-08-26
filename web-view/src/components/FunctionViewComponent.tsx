import { Button, Col, Container, Row } from "react-bootstrap";
import { ArrowClockwise } from "react-bootstrap-icons";
import type {
  FunctionResource,
  TsCodeCheckResource,
} from "../ressources/classRessources";
import LoadingComponent from "./LoadingComponent";
import FunctionCardComponent from "./functionComponenets/functionCardComponent";
import { vscode } from "../api/vscodeAPI";
//import type { VSCodeAPIWrapper } from "../api/vscodeAPI";

type FunctionViewComponentProps = {
  functions: FunctionResource[];
  loading: boolean;

  reLoad: (type: "classes" | "functions") => void;

  testedTsFileMap: Map<string, TsCodeCheckResource>;

  //vscode: VSCodeAPIWrapper;
};

function FunctionViewComponent({
  functions,
  loading,
  reLoad,
  testedTsFileMap,
}: FunctionViewComponentProps) {
  const reLoadFunctions = () => reLoad("functions");

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
          <Container>
            <Row>
              {functions.map((foo, index) => (
                <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <FunctionCardComponent
                    func={foo}
                    tsCodeValidation={getTsCodeValidation(foo.tsFile.path)}
                    vscode={vscode}
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
