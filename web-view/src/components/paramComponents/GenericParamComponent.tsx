import Form from "react-bootstrap/Form";

import { useEffect, useState } from "react";
import { Button, Col, FormGroup, Row } from "react-bootstrap";
import type {
  ParamFormTypeResource,
  ValidationTypeResource,
} from "../../ressources/frontend/paramResources";
import ParameterFormControllComponent from "./ParameterFormControllComponenet";

function GenericParameterComponent({
  paramFormType,
}: {
  paramFormType: ParamFormTypeResource;
}) {
  const { baseType, genericArgs } = paramFormType.param.typeInfo.genericRes!;

  //Listen struckturen
  const containerTypes = [
    "Array",
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

    let parsedValue;

    try {
      switch (baseType.toLowerCase()) {
        // * Array sollte per default zur Array component (nur Fallback)
        case "array": {
          const arrayValues = [];
          for (let i = 0; i < arraySize; i++) {
            const validation = paramValidations[getElementName(0, i)];
            if (validation && validation.parsedValue !== undefined) {
              arrayValues.push(validation.parsedValue);
            }
          }

          // * das default
          parsedValue = arrayValues;
          break;
        }

        case "set": {
          // ? Set<T> -> new Set([value1, value2, ...])
          const setValues = [];
          for (let i = 0; i < arraySize; i++) {
            const validation = paramValidations[getElementName(0, i)];
            if (validation && validation.parsedValue !== undefined) {
              setValues.push(validation.parsedValue);
            }
          }
          try {
            const setValue = new Set(setValues);
            parsedValue = { genericType: "set", values: Array.from(setValue) };
          } catch (err) {
            parsedValue = null;
            console.error("ERROR PARSING VALUE TO SET:", err);
          }

          break;
        }

        case "map": {
          const mapEntries: [unknown, unknown][] = [];

          for (let i = 0; i < arraySize; i++) {
            const keyValidation = paramValidations[getElementName(0, i)];
            const valueValidation = paramValidations[getElementName(1, i)];

            if (
              keyValidation?.parsedValue !== undefined &&
              valueValidation?.parsedValue !== undefined
            ) {
              const entry: [unknown, unknown] = [
                keyValidation.parsedValue,
                valueValidation.parsedValue,
              ];
              mapEntries.push(entry);
            }
          }

          try {
            const mapValue = new Map(mapEntries);
            parsedValue = {
              genericType: "map",
              entries: Array.from(mapValue.entries()),
            };
          } catch (err) {
            parsedValue = null;
            console.error("ERROR PARSING VALUE TO MAP:", err);
          }
          break;
        }

        case "record": {
          const recordObj: Record<string, unknown> = {};
          for (let i = 0; i < arraySize; i++) {
            const keyValidation = paramValidations[getElementName(0, i)];
            const valueValidation = paramValidations[getElementName(1, i)];

            if (
              keyValidation?.parsedValue !== undefined &&
              valueValidation?.parsedValue !== undefined
            ) {
              const key = keyValidation.parsedValue;
              if (typeof key === "string" || typeof key === "number") {
                recordObj[key] = valueValidation.parsedValue;
              }
            }
          }
          parsedValue = recordObj;
          break;
        }
        case "promise": {
          // ? Promise<T> -> Promise.resolve(value)
          const validation = paramValidations[getElementName(0)];
          try {
            const tryResolvePromise = async () => {
              if (validation?.parsedValue !== undefined) {
                //kurzu checken
                await Promise.resolve(validation.parsedValue);
                parsedValue = {
                  genericType: "promise",
                  value: validation.parsedValue!,
                };
              }
            };

            tryResolvePromise();
          } catch (err) {
            parsedValue = null;
            console.error("ERROR PARSING VALUE TO MAP:", err);
          }
          break;
        }

        default: {
          // ? Generic Types wie MyClass<T> -> sammle alle Argumente als Array oder einzeln
          const genericValues = [];
          for (let y = 0; y < genericArgs.length; y++) {
            const validation = paramValidations[getElementName(y)];
            if (validation?.parsedValue !== undefined) {
              genericValues.push(validation.parsedValue);
            }
          }
          parsedValue =
            genericValues.length === 1 ? genericValues[0] : genericValues;
        }
      }
    } catch (err) {
      console.warn(
        `Error beim parsen in TypeScript Konstruckt ${paramFormType.param.paramName} from generic type ${baseType}: `,
        err
      );
    }

    console.log("Parsed VAlue: ", parsedValue);

    paramFormType.onValidationChange!(paramFormType.param.paramName, {
      isValid: allErrors.length === 0,
      errors: allErrors,
      parsedValue: parsedValue ?? null,
    });
  }, [
    paramValidations,
    paramFormType.param.paramName,
    paramFormType.onValidationChange!,
  ]);

  const getElementName = (tupelIndex: number, ArrayElementIndex?: number) => {
    const arrayPart =
      ArrayElementIndex !== undefined ? `[${ArrayElementIndex}]` : `[0]`;

    return `${paramFormType.param.paramName}[${tupelIndex}]_${arrayPart}`;
  };

  const addToArray = () => setArraySize(arraySize + 1);
  const minToArray = () => {
    if (arraySize <= 0) return;
    const newSize = arraySize - 1;
    setArraySize(newSize);

    setInternValues((prevValues) => {
      const newValues = { ...prevValues };
      for (let y = 0; y < genericArgs.length; y++) {
        delete newValues[getElementName(y, newSize)];
      }
      return newValues;
    });

    setParamValidations((prevValidations) => {
      const newValidations = { ...prevValidations };
      for (let y = 0; y < genericArgs.length; y++) {
        delete newValidations[getElementName(y, newSize)];
      }
      return newValidations;
    });
  };

  return (
    <FormGroup key={paramFormType.index}>
      <Form.Label>
        <strong>{paramFormType.param.paramName}</strong>
        {paramFormType.param.isOptional && "?"}:{" "}
        {paramFormType.param.typeInfo.typeAsString}
      </Form.Label>

      {/* Container types */}
      {containerTypes.includes(baseType) ? (
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
              <Row className="mb-3">
                {genericArgs &&
                  genericArgs.map((arg, y) => (
                    <Col>
                      <ParameterFormControllComponent
                        index={y}
                        param={{
                          paramName: getElementName(y, i),
                          typeInfo: arg,
                          isOptional: arg.isOptional ?? false,
                          isRest: arg.isRest,
                        }}
                        formValue={internValues[getElementName(y, i)] || ""}
                        validated={paramFormType.validated}
                        error={
                          paramValidations[getElementName(y, i)]?.errors[0]
                        }
                        onValidationChange={handleChildChange}
                        onChange={handelInternChange}
                        hideLabel={true}
                        isTopLevel={false}
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
            {arraySize > 0 && (
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
          {/* Not Container types */}
          <Row className="mb-3">
            {genericArgs &&
              genericArgs.map((arg, y) => (
                <Col>
                  <ParameterFormControllComponent
                    index={y}
                    param={{
                      paramName: getElementName(y),
                      typeInfo: arg,
                      isOptional: arg.isOptional ?? false,
                      isRest: arg.isRest,
                    }}
                    formValue={internValues[getElementName(y)] || ""}
                    validated={paramFormType.validated}
                    error={paramValidations[getElementName(y)]?.errors[0]}
                    onValidationChange={handleChildChange}
                    onChange={handelInternChange}
                    hideLabel={true}
                    isTopLevel={false}
                    instancesAsParamsMap={paramFormType.instancesAsParamsMap}
                  />
                </Col>
              ))}
          </Row>
        </div>
      )}
    </FormGroup>
  );
}

export default GenericParameterComponent;
