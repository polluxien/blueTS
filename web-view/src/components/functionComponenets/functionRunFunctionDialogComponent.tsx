import { Badge, Button, Container, Form, Modal } from "react-bootstrap";

import { useContext, useState } from "react";
import { validateSubmit } from "../../helper/validateSubmit";
import type { FunctionResource } from "../../ressources/backend/tsCompilerAPIResources";
import type { ValidationTypeResource } from "../../ressources/frontend/paramResources";
import type { RunFunctionRequestType } from "../../ressources/request/functionRequest";
import ParameterFormControllComponent from "../paramComponents/ParameterFormControllComponenet";
import { VscodeContext } from "../../api/vscodeAPIContext";

type FunctionRunFunctionDialogComponentProps = {
  func: FunctionResource;
  close: () => void;

  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;
  functionResult: string | Error | undefined;
};
function FunctionRunFunctionDialogComponent({
  func,
  close,
  functionResult,
  instancesAsParamsMap,
}: FunctionRunFunctionDialogComponentProps) {
  const vscode = useContext(VscodeContext);

  const [validated, setValidated] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, Error>>({});

  //form Values before parsing
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  //Validierungsstatus von allen Params
  const [paramValidations, setParamValidations] = useState<
    Record<string, ValidationTypeResource>
  >({});

  const funcVariables = func.parameters;

  function handleChange(paramName: string, newFormValue: string) {
    setFormValues((prev) => ({ ...prev, [paramName]: newFormValue }));
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
      postFunctionMessage();
      setValidated(true);
      return;
    }

    const { newErrors, newParsedValues } = validateSubmit(
      funcVariables,
      paramValidations,
      formValues
    );

    setErrors(newErrors);
    setValidated(true);

    if (Object.keys(newErrors).length === 0) {
      postFunctionMessage(newParsedValues);
    } else {
      console.log("Ich habe folgende Errors: ", errors);
    }
  }

  function postFunctionMessage(newParsedValues?: Record<string, unknown>) {
    let metParameter: unknown[] = [];

    if (newParsedValues) {
      metParameter = funcVariables.map((param) => {
        return newParsedValues[param.paramName];
      });
    }

    const runMethodeInInstanceType: RunFunctionRequestType = {
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
                          formValue={formValues[param.paramName] || ""}
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
