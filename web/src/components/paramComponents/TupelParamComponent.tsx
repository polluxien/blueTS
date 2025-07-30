import { Col, Form, Row } from "react-bootstrap";
import type { TypeRessource } from "../../ressources/classRessources";
import type { ParamFormTypeResource } from "./ParameterFormControllComponenet";
import ParameterFormControllComponent from "./ParameterFormControllComponenet";
//import { useState } from "react";

function TupelParamComponent({
  paramFormType,
}: {
  paramFormType: ParamFormTypeResource;
}) {
  const typeRes: TypeRessource = paramFormType.param.typeInfo;
  // const [tupelValues, setTupelValues] = useState<Record<number, any>>();

  return (
    <>
      <Form.Label>
        <strong>{paramFormType.param.paramName}</strong>
        {paramFormType.param.optional && "?"}:{" "}
        {paramFormType.param.typeInfo.typeAsString}
      </Form.Label>
      <Row className="mb-3">
        {typeRes.tupleElements!.map((tupelParam, index) => (
          <Col>
            <ParameterFormControllComponent
              index={index}
              param={{
                ...paramFormType.param,
                typeInfo: tupelParam,
              }}
              value={paramFormType.value}
              validated={paramFormType.validated}
              error={paramFormType.error}
              onChange={paramFormType.onChange}
            />
          </Col>
        ))}
      </Row>
    </>
  );
}

export default TupelParamComponent;
