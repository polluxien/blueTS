import { Badge, Button, Container, Form, Modal } from "react-bootstrap";
import type {
  FunctionResource,
  RunFunctionType,
} from "../../ressources/classRessources";
import ParameterFormControllComponent, {
  type ValidationTypeResource,
} from "../paramComponents/ParameterFormControllComponenet";
import { useState } from "react";
import { validateFormControllType } from "../../helper/validateType";
import type { VSCodeAPIWrapper } from "../../api/vscodeAPI";

type FunctionRunFunctionDialogComponentProps = {
  func: FunctionResource;
  close: () => void;

  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;
  functionResult: string | Error | undefined;

  vscode: VSCodeAPIWrapper;
};
function FunctionRunFunctionDialogComponent({
  func,
  close,
  functionResult,
  instancesAsParamsMap,
  vscode,
}: FunctionRunFunctionDialogComponentProps) {
  const [validated, setValidated] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, Error>>({});

  //form Values before parsing
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  //Validierungsstatus von allen Params
  const [paramValidations, setParamValidations] = useState<
    Record<string, ValidationTypeResource>
  >({});

  const funcVariables = func.parameters;

  function handleChange(paramName: string, value: string) {
    setFormValues((prev) => ({ ...prev, [paramName]: value }));
  }

  const handleParameterValidation = (
    paramName: string,
    validationInfo: ValidationTypeResource
  ) => {
    setParamValidations((prev) => ({
      ...prev,
      [paramName]: validationInfo,
    }));
  };

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (funcVariables.length === 0) {
      postMethodMessage();
      setValidated(true);
      return;
    }

    const newErrors: Record<string, Error> = {};
    const newParsedValues: Record<string, unknown> = {};

    for (const param of funcVariables) {
      const validation = paramValidations[param.paramName];

      if (!validation || !validation.isValid) {
        // Fallback
        if (!validation) {
          const value = formValues[param.paramName];
          const { err, parsedValue } = validateFormControllType(param, value);

          if (err) {
            newErrors[param.paramName] = err;
          } else {
            newParsedValues[param.paramName] = parsedValue;
          }
        } else {
          // verwende gesammelte Validierungsfehler
          if (validation.errors.length > 0) {
            newErrors[param.paramName] = validation.errors[0];
          }
        }
      } else {
        // verwende den parsedValue
        newParsedValues[param.paramName] = validation.parsedValue;
      }
    }

    setErrors(newErrors);
    setValidated(true);

    if (Object.keys(newErrors).length === 0) {
      postMethodMessage(newParsedValues);
    } else {
      console.log("Ich habe folgende Errors: ", errors);
    }
  }

  function postMethodMessage(newParsedValues?: Record<string, unknown>) {
    let metParameter: unknown[] = [];

    if (newParsedValues) {
      metParameter = funcVariables.map((param) => {
        return newParsedValues[param.paramName];
      });
    }

    const runMethodeInInstanceType: RunFunctionType = {
      functionName: func.functionName,
      params: metParameter,
      specs: { isAsync: func.specs.isAsync },
      tsFile: func.tsFile,
    };
    console.log(
      `run ${func.functionName} with values: `,
      JSON.stringify(runMethodeInInstanceType, null, 2)
    );

    vscode.postMessage([
      {
        command: "runFunction",
        data: runMethodeInInstanceType,
      },
    ]);
  }

  return (
    <>
      <Modal show={true} onHide={close} size="lg" centered>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>run function: {func.functionName}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              {/* Hier sind die ganzen specs Aufgelistet als tags zur  info */}
              <div className="d-flex flex-wrap gap-2 mb-2">
                {func.specs.isAsync && <Badge bg="dark"> async</Badge>}
              </div>
              {/* Hier methodName */}
              <p>
                {func.functionName +
                  "(" +
                  (funcVariables.length === 0 ? ")" : "")}
              </p>{" "}
              {/* Hier methode Form controll Componenets */}
              {funcVariables.length > 0 && (
                <div className="mb-4">
                  <Container
                    style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
                  >
                    {funcVariables.map((param, index) => (
                      <Container
                        style={{
                          backgroundColor: "#f7f9fb",
                          padding: "1rem",
                          borderRadius: "10px",
                        }}
                      >
                        <ParameterFormControllComponent
                          index={index}
                          param={param}
                          value={formValues[param.paramName] || ""}
                          validated={validated}
                          error={errors[param.paramName]}
                          onChange={handleChange}
                          onValidationChange={handleParameterValidation}
                          instancesAsParamsMap={instancesAsParamsMap}
                        ></ParameterFormControllComponent>
                      </Container>
                    ))}
                  </Container>
                </div>
              )}
              {funcVariables.length > 0 && <p>{")"}</p>}
              {/* Hier letzte methoden Rückgaben */}
              {functionResult && (
                <div className="mb-4">
                  <hr></hr>{" "}
                  <Form.Group>
                    <Form.Label>
                      <strong>return Value</strong>
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={1}
                      disabled
                      readOnly
                      value={functionResult as string}
                    />
                  </Form.Group>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit">
              run method
            </Button>
            <Button variant="secondary" type="button" onClick={close}>
              Close
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default FunctionRunFunctionDialogComponent;
