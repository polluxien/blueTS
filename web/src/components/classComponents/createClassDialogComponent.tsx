import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import type { ClassRessource } from "../../ressources/classRessources";
import { FormControl, FormGroup } from "react-bootstrap";

function CreateClassDialogComponent({ cls }: { cls: ClassRessource }) {
  const classVariables = cls.constructor?.parameters;

  const handleSubmit = () => {};
 // const validated = () => {};

  return (
    <>
      <div
        className="modal show"
        style={{ display: "block", position: "initial" }}
      >
        <Modal.Dialog>
          <Modal.Header closeButton>
            <Modal.Title>Create Class: {cls.className}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Class {cls.className} (
              {classVariables && classVariables.length > 0
                ? classVariables.map((param) => param.name).join(", ")
                : ""}
              )
            </p>
            {classVariables && classVariables.length > 0 && (
              <Form
                //validated={validated}
                onSubmit={handleSubmit}
              >
                {classVariables.map((param, index) => (
                  <FormGroup key={index}>
                    <Form.Label>
                      {param.name}: {param.type}
                      {param.optional && "?"}
                    </Form.Label>
                    //hier muss noch clientseitige typüberprüfung stattfinden
                    <FormControl type="text"></FormControl>
                  </FormGroup>
                ))}
              </Form>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary">Close</Button>
            <Button variant="primary">create Class</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </div>
    </>
  );
}

export default CreateClassDialogComponent;
