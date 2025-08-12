import { Button } from "react-bootstrap";
import { ArrowClockwise } from "react-bootstrap-icons";

type FunctionViewComponentProps = {
  //functions: unknown;

  refreshFunctions: () => void;
};

function FunctionViewComponent({
  //functions,
  refreshFunctions,
}: FunctionViewComponentProps) {
  return (
    <div className="mb-2">
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1 className="m-0">TS-Functions</h1>
          <Button
            onClick={refreshFunctions}
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
    </div>
  );
}

export default FunctionViewComponent;
