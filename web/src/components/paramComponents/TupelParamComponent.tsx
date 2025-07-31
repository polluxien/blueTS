import { Col, Form, Row } from "react-bootstrap";
import type { TypeRessource } from "../../ressources/classRessources";
import type {
  ParamFormTypeResource,
  ValidationTypeResource,
} from "./ParameterFormControllComponenet";
import ParameterFormControllComponent from "./ParameterFormControllComponenet";
import { useEffect, useState } from "react";
//import { useState } from "react";

function TupelParamComponent({
  paramFormType,
}: {
  paramFormType: ParamFormTypeResource;
}) {
  const typeRes: TypeRessource = paramFormType.param.typeInfo;
  const [internValues, setInternValues] = useState<Record<string, string>>({});
  const [paramValidations, setParamValidations] = useState<
    Record<string, ValidationTypeResource>
  >({});

  function handleChildChange(
    paramName: string,
    validationType: ValidationTypeResource
  ) {
    setParamValidations((prev) => ({ ...prev, [paramName]: validationType }));
  }

  function handelInternChange(paramName: string, value: string) {
    setInternValues((prev) => ({ ...prev, [paramName]: value }));
  }

  useEffect(() => {
    //sammle alle Errors
    const allErrors = Object.values(paramValidations).flatMap(
      (value) => value.errors
    );

    const tupelSize = paramFormType.param.typeInfo.tupleElements!.length;

    const myTupel: unknown[] = [];
    for (let i = 0; i < tupelSize; i++) {
      const validation =
        paramValidations[`${paramFormType.param.paramName}[${i}]`];
      if (validation && validation.isValid) {
        myTupel.push(validation.parsedValue);
      } else {
        //Fallback an dieser Stelle ist noch nicht valid
        myTupel.push("");
      }
    }

    paramFormType.onValidationChange!(paramFormType.param.paramName, {
      isValid: allErrors.length === 0,
      errors: allErrors,
      parsedValue: myTupel,
    });
  }, [
    paramValidations,
    paramFormType.param.paramName,
    paramFormType.onValidationChange!,
  ]);

  const getElementName = (elementIndex: number) => {
    return `${paramFormType.param.paramName}[${elementIndex}]`;
  };

  return (
    <>
      <Form.Label>
        <strong>{paramFormType.param.paramName}</strong>
        {paramFormType.param.optional && "?"}:{" "}
        {paramFormType.param.typeInfo.typeAsString}
      </Form.Label>
      <Row className="mb-3">
        {typeRes.tupleElements!.map((tupelParam, i) => (
          <Col>
            <ParameterFormControllComponent
              index={i}
              param={{
                ...paramFormType.param,
                typeInfo: tupelParam,
                paramName: getElementName(i),
              }}
              value={internValues[getElementName(i)] || ""}
              validated={paramFormType.validated}
              error={paramValidations[getElementName(i)]?.errors[0]}
              onValidationChange={handleChildChange}
              onChange={handelInternChange}
              hideLabel={true}
            />
          </Col>
        ))}
      </Row>
    </>
  );
}

export default TupelParamComponent;
