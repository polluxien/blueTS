import { Button, Modal, Table, Badge } from "react-bootstrap";
import type {
  CompileErrorResource,
  TsFileResource,
} from "../ressources/classRessources";

type CompilerErrorModalComponentType = {
  close: () => void;
  tsFile: TsFileResource;
  compilerErrs: CompileErrorResource[];
};

function CompilerErrorModalComponent({
  close,
  tsFile,
  compilerErrs,
}: CompilerErrorModalComponentType) {
  return (
    <Modal show={true} onHide={close} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <strong style={{ color: "red" }}>Compiler Error</strong> in File{" "}
          <strong>{tsFile.name}</strong>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
        <i>{tsFile.path} </i>
        <hr></hr>
        <Table striped bordered hover responsive size="sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Location</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {compilerErrs.map((err, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  {err.row != null && err.col != null ? (
                    <Badge bg="light" text="dark">
                      Row {err.row}, Col {err.col}
                    </Badge>
                  ) : (
                    <Badge bg="secondary">Unknown</Badge>
                  )}
                </td>
                <td style={{ whiteSpace: "pre-wrap" }}>{err.message}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CompilerErrorModalComponent;
