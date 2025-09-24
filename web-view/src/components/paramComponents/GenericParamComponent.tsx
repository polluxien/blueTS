import Form from "react-bootstrap/Form";

import { useEffect, useState } from "react";
import { Button, Col, FormGroup, Row } from "react-bootstrap";
import type {
  ParamFormTypeResource,
  ValidationTypeResource,
} from "../../ressources/frontend/paramResources";
import ParameterFormControllComponent from "./ParameterFormControllComponenet";
import type { ParameterResource } from "../../ressources/backend/tsCompilerAPIResources";

function GenericParameterComponent({
  paramFormType,
}: {
  paramFormType: ParamFormTypeResource;
}) {
  const { baseType, genericArgs } = paramFormType.param.typeInfo.genericRes!;

  //Listen struckturen
  const containerTypes = [
    "Array",
    "Readonly",
    "Set",
    "WeakSet",
    "Map",
    "WeakMap",
    "Record",
  ];

  const [arraySize, setArraySize] = useState<number>(1);
  const [internValues, setInternValues] = useState<Record<string, string>>({});

  const [paramValidations, setParamValidations] = useState<
    Record<string, ValidationTypeResource>
  >({});

  const isRest = paramFormType.param.isRest;

  function handleChildChange(
    paramName: string,
    validationType: ValidationTypeResource
  ) {
    setParamValidations((prev) => ({ ...prev, [paramName]: validationType }));
  }

  function handelInternChange(paramName: string, value: string) {
    setInternValues((prev) => ({ ...prev, [paramName]: value }));
  }

  const elementParam: ParameterResource = {
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
      } else if (elementParam.isOptional) {
        myArr.push(undefined);
      } else {
        //Fallback an dieser Stelle ist noch nicht valid
        myArr.push("");
      }
    }

    paramFormType.onValidationChange!(paramFormType.param.paramName, {
      isValid: allErrors.length === 0,
      errors: allErrors,
      // ? bei rest übergebe ich im backend values einzeln

      parsedValue: isRest ? { restParams: myArr } : myArr,
    });
  }, [paramValidations, arraySize]);

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

    // ! ich könnte wenn es sich um containerTypes handelt array auslösen
    // ! wenn mehr als ein args tupel
    // ! und sonst könnte ich standart lösen
  };

  return (
    <FormGroup key={paramFormType.index}>
      <Form.Label>
        <strong>
          {isRest ? "..." : ""}
          {paramFormType.param.paramName}
        </strong>
        {paramFormType.param.isOptional && "?"}:{" "}
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
        {containerTypes.includes(baseType) ? (
          <div>
            <p>{"["}</p>
            {[...Array(arraySize)].map((_, i) => (
              <div key={i}>
                <Row className="mb-3">
                  {genericArgs &&
                    genericArgs.map((arg, i) => (
                      <Col>
                        <ParameterFormControllComponent
                          index={i}
                          param={{
                            paramName: "",
                            typeInfo: arg,
                            isOptional: arg.isOptional ?? false,
                            isRest: arg.isRest,
                          }}
                          formValue={internValues[getElementName(i)] || ""}
                          validated={paramFormType.validated}
                          error={paramValidations[getElementName(i)]?.errors[0]}
                          onValidationChange={handleChildChange}
                          onChange={handelInternChange}
                          hideLabel={true}
                          instancesAsParamsMap={
                            paramFormType.instancesAsParamsMap
                          }
                        />
                      </Col>
                    ))}
                </Row>
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
        ) : (
          <div>
            <Row className="mb-3">
              {genericArgs &&
                genericArgs.map((arg, i) => (
                  <Col>
                    <ParameterFormControllComponent
                      index={i}
                      param={{
                        paramName: "",
                        typeInfo: arg,
                        isOptional: arg.isOptional ?? false,
                        isRest: arg.isRest,
                      }}
                      formValue={internValues[getElementName(i)] || ""}
                      validated={paramFormType.validated}
                      error={paramValidations[getElementName(i)]?.errors[0]}
                      onValidationChange={handleChildChange}
                      onChange={handelInternChange}
                      hideLabel={true}
                      instancesAsParamsMap={paramFormType.instancesAsParamsMap}
                    />
                  </Col>
                ))}
            </Row>
          </div>
        )}
      </div>
    </FormGroup>
  );
}

export default GenericParameterComponent;
