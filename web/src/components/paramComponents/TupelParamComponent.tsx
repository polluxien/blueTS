import { Col, Form, Row } from "react-bootstrap";
import type { TypeRessource } from "../../ressources/classRessources";
import type { ParamFormType } from "./ParameterFormControllComponenet";
import ParameterFormControllComponent from "./ParameterFormControllComponenet";

function TupelParamComponent({
  paramFormType,
}: {
  paramFormType: ParamFormType;
}) {
  const typeRes: TypeRessource = paramFormType.param.typeInfo;

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
