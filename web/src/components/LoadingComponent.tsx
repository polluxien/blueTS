import { Spinner } from "react-bootstrap";

type LoadingComponentType = {
  compPart: string;
};

function LoadingComponent({ compPart }: LoadingComponentType) {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{
        width: "100%",
        minHeight: "100px", 
        textAlign: "center",
        gap: "0.5rem", 
      }}
    >
      <Spinner animation="border" variant="primary" />
      <p style={{ margin: 0 }}>
        Directory is being analyzed for existing <strong>{compPart}</strong>
      </p>
    </div>
  );
}

export default LoadingComponent;
