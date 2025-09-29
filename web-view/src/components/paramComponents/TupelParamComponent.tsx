import { Col, Form, Row } from "react-bootstrap";

import ParameterFormControllComponent from "./ParameterFormControllComponenet";
import { useEffect, useState } from "react";
import type {
  ParamFormTypeResource,
  ValidationTypeResource,
} from "../../ressources/frontend/paramResources";
import type { TypeResource } from "../../ressources/backend/tsCompilerAPIResources";
//import { useState } from "react";

function TupelParamComponent({
  paramFormType,
}: {
  paramFormType: ParamFormTypeResource;
}) {
  const typeRes: TypeResource = paramFormType.param.typeInfo;
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
      const elementName = getElementName(i);
      const validation = paramValidations[elementName];
      const tupleElement = typeRes.tupleElements![i];

      if (validation && validation.isValid ) {
        myTupel.push(validation.parsedValue);
      } else {
        //Fallbacks
        if (tupleElement.isOptional) {
          myTupel.push(undefined);
        } else {
          myTupel.push(null);
        }
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
        {paramFormType.param.isOptional && "?"}:{" "}
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
                ...(tupelParam.isOptional && {
                  isOptional: tupelParam.isOptional,
                }),
                ...(tupelParam.isRest && {
                  isRest: tupelParam.isRest,
                }),
              }}
              formValue={internValues[getElementName(i)] || ""}
              validated={paramFormType.validated}
              error={paramValidations[getElementName(i)]?.errors[0]}
              onValidationChange={handleChildChange}
              onChange={handelInternChange}
              hideLabel={true}
              isTopLevel={false}
              instancesAsParamsMap={paramFormType.instancesAsParamsMap}
            />
          </Col>
        ))}
      </Row>
    </>
  );
}

export default TupelParamComponent;
