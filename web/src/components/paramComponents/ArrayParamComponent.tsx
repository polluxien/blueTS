import Form from "react-bootstrap/Form";

import { useState } from "react";
import type { ParameterRessource } from "../../ressources/classRessources";
import { Button, Col, FormGroup, Row } from "react-bootstrap";
import ParameterFormControllComponent, {
  type ParamFormType,
} from "./ParameterFormControllComponenet";

function ArrayParameterComponent({
  paramFormType,
}: {
  paramFormType: ParamFormType;
}) {
  const [arraySize, setArraySize] = useState<number>(1);

  const elementParam: ParameterRessource = {
    ...paramFormType.param,
    typeInfo: paramFormType.param.typeInfo.arrayType!,
  };

  console.log(elementParam);

  const addToArray = () => setArraySize(arraySize + 1);
  const minToArray = () =>
    arraySize > 1 ? setArraySize(arraySize - 1) : new Error("");

  return (
    <FormGroup key={paramFormType.index}>
      <Form.Label>
        <strong>{paramFormType.param.paramName}</strong>
        {paramFormType.param.optional && "?"}:{" "}
        {paramFormType.param.typeInfo.typeAsString.replace("[]", "")}
        {"["}
      </Form.Label>

      <div
        className="mb-4"
        style={{
          backgroundColor: "#f0efff",
          borderRadius: "8px",
          padding: "1.5rem",
        }}
      >
        {[...Array(arraySize)].map((_, i) => (
          <div key={i}>
            {
              (elementParam.paramName = `${paramFormType.param.paramName}[${i}]`)
            }
            <ParameterFormControllComponent
              index={i}
              param={elementParam}
              value={paramFormType.value}
              validated={paramFormType.validated}
              error={paramFormType.error}
              onChange={paramFormType.onChange}
            />
            <Form.Control.Feedback type="invalid">
              {paramFormType.error?.message || "This field is required"}
            </Form.Control.Feedback>
          </div>
        ))}
        <Row className="justify-content-md-center mt-4">
          <Col xs="auto">
            <Button variant="outline-success" onClick={addToArray}>
              +
            </Button>
          </Col>
          {arraySize > 1 && (
            <Col xs="auto">
              <Button variant="outline-danger" onClick={minToArray}>
                -
              </Button>
            </Col>
          )}
        </Row>
      </div>

      <p>{"]"}</p>
    </FormGroup>
  );
}

export default ArrayParameterComponent;
