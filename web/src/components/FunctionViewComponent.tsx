import { Button, Col, Container, Row } from "react-bootstrap";
import { ArrowClockwise } from "react-bootstrap-icons";
import type { FunctionResource } from "../ressources/classRessources";
//import type { VSCodeAPIWrapper } from "../api/vscodeAPI";

type FunctionViewComponentProps = {
  functions: FunctionResource[];
  loading: boolean;

  reLoad: (type: "classes" | "functions") => void;

  //vscode: VSCodeAPIWrapper;
};

function FunctionViewComponent({
  functions,
  loading,
  reLoad,
}: FunctionViewComponentProps) {
  const reLoadFunctions = () => reLoad("functions");

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
                  {foo.functionName}
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
  );
}

export default FunctionViewComponent;
