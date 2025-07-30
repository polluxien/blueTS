import Form from "react-bootstrap/Form";

import { useEffect, useState } from "react";
import type { ParameterRessource } from "../../ressources/classRessources";
import { Button, Col, FormGroup, Row } from "react-bootstrap";
import ParameterFormControllComponent, {
  type ParamFormTypeResource,
  type ValidationTypeResource,
} from "./ParameterFormControllComponenet";

function ArrayParameterComponent({
  paramFormType,
}: {
  paramFormType: ParamFormTypeResource;
}) {
  const [arraySize, setArraySize] = useState<number>(1);
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

  const elementParam: ParameterRessource = {
    ...paramFormType.param,
    typeInfo: paramFormType.param.typeInfo.arrayType!,
  };

  useEffect(() => {
    //sammle alle Errors
    const allErrors = Object.values(paramValidations).flatMap(
      (value) => value.errors
    );

    const myArr: unknown[] = [];

    //iterier über objParams und füge an jedem attribute geparsed value ein
    for (let i = 0; i < arraySize; i++) {
      const validation =
        paramValidations[`${paramFormType.param.paramName}[${i}]`];
      if (validation && validation.isValid) {
        myArr.push(validation.parsedValue);
      } else if (elementParam.optional) {
        myArr.push(undefined);
      } else {
        //Fallback an dieser Stelle ist noch nicht valid
        myArr.push("");
      }
    }

    paramFormType.onValidationChange!(paramFormType.param.paramName, {
      isValid: allErrors.length === 0,
      errors: allErrors,
      parsedValue: myArr,
    });
  }, [
    paramValidations,
    arraySize,
    paramFormType.param.paramName,
    elementParam.optional,
    paramFormType.onValidationChange!,
  ]);

  const getElementName = (elementIndex: number) => {
    return `${paramFormType.param.paramName}[${elementIndex}]`;
  };

  const addToArray = () => setArraySize(arraySize + 1);
  const minToArray = () => {
    if (arraySize <= 1) return;

    const newSize = arraySize - 1;
    setArraySize(newSize);

    //pop die letezten werte
    setInternValues((prevValues) => {
      const newValues = { ...prevValues };
      delete newValues[`${newSize}`];
      return newValues;
    });
    setParamValidations((prevValidations) => {
      const newValidations = { ...prevValidations };
      delete newValidations[`${paramFormType.param.paramName}[${newSize}]`];
      return newValidations;
    });
  };

  return (
    <FormGroup key={paramFormType.index}>
      <Form.Label>
        <strong>{paramFormType.param.paramName}</strong>
        {paramFormType.param.optional && "?"}:{" "}
        {paramFormType.param.typeInfo.typeAsString}
        {/*paramFormType.param.typeInfo.typeAsString.replace("[]", "") */}
      </Form.Label>

      <div
        className="mb-4"
        style={{
          backgroundColor: "#f0efff",
          borderRadius: "8px",
          padding: "1.5rem",
        }}
      >
        <p>{"["}</p>
        {[...Array(arraySize)].map((_, i) => (
          <div key={i}>
            <ParameterFormControllComponent
              index={i}
              param={{
                ...elementParam,
                paramName: getElementName(i),
              }}
              value={internValues[getElementName(i)] || ""}
              validated={paramFormType.validated}
              error={paramValidations[getElementName(i)]?.errors[0]}
              onChange={handelInternChange}
              onValidationChange={handleChildChange}
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
        <p>{"]"}</p>
      </div>
    </FormGroup>
  );
}

export default ArrayParameterComponent;
