import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

function FileComponent() {
  return (
    <>
      <Form>
        <Row>
          <Col>
            <Form.Group className="mb-3" id="formGridCheckbox">
              <Form.Check
                type="checkbox"
                label="Use current workspace as directory"
                //value={checked}
              />
            </Form.Group>{" "}
          </Col>
          <Col>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Control
                type="file"
                multiple
                {...{ webkitdirectory: true, directory: true }}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </>
  );
}

export default FileComponent;
