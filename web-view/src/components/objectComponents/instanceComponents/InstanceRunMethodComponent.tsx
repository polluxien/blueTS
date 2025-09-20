import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { useState } from "react";

import { Badge } from "react-bootstrap";
import type { VSCodeAPIWrapper } from "../../../api/vscodeAPI.ts";
import { validateSubmit } from "../../../helper/validateSubmit.ts";
import type { MethodResource } from "../../../ressources/backend/tsCompilerAPIResources.ts";
import type { ValidationTypeResource } from "../../../ressources/frontend/paramResources.ts";
import type { RunMethodInInstanceRequestType } from "../../../ressources/request/objectRequest.ts";
import ParameterFormControllComponent from "../../paramComponents/ParameterFormControllComponenet.tsx";

type InstanceMethodComponentProps = {
  met: MethodResource;
  insName: string;
  vscode: VSCodeAPIWrapper;
  methodResults: Error | string | undefined;
  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;
};

function InstanceMethodComponent({
  met,
  insName,
  vscode,
  methodResults,
  instancesAsParamsMap,
}: InstanceMethodComponentProps) {
  const [validated, setValidated] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, Error>>({});

  //form Values before parsing
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  //Validierungsstatus von allen Params
  const [paramValidations, setParamValidations] = useState<
    Record<string, ValidationTypeResource>
  >({});

  const metVariables = met.parameters || [];

  function handleChange(paramName: string, newFormvalue: string) {
    setFormValues((prev) => ({ ...prev, [paramName]: newFormvalue }));
  }

  const handleParamValidation = (
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

    if (metVariables.length === 0) {
      postMethodMessage();
      setValidated(true);
      return;
    }

    const { newErrors, newParsedValues } = validateSubmit(
      metVariables,
      paramValidations,
      formValues
    );

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
      metParameter = metVariables.map((param) => {
        return newParsedValues[param.paramName];
      });
    }

    const runMethodeInInstanceType: RunMethodInInstanceRequestType = {
      instanceName: insName,
      methodName: met.methodName,
      params: metParameter,
      specs: { methodKind: met.specs.methodKind, isAsync: met.specs.isAsync },
    };
    console.log(
      `run ${met.methodName} in instance ${insName} with value: `,
      JSON.stringify(runMethodeInInstanceType, null, 2)
    );

    vscode.postMessage([
      {
        command: "runMethodInInstance",
        data: runMethodeInInstanceType,
      },
    ]);
  }

  return (
    <div>
      {/* Hier sind die ganzen specs Aufgelistet als tags zur  info */}
      <div className="d-flex flex-wrap gap-2 mb-2">
        <Badge bg="dark">{met.specs.visibility}</Badge>
        {met.specs.isStatic && <Badge bg="dark">static</Badge>}
        {met.specs.isAbstract && <Badge bg="dark">abstract</Badge>}
        {met.specs.isAsync && <Badge bg="dark"> async</Badge>}
        {met.specs.methodKind !== "default" && (
          <Badge bg="dark">{met.specs.methodKind}</Badge>
        )}
      </div>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        {/* Hier methodName */}
        <p>
          {insName +
            "." +
            met.methodName +
            "(" +
            (metVariables.length === 0 ? ")" : "")}
        </p>{" "}
        {/* Hier methode Form controll Componenets */}
        {metVariables.length > 0 && (
          <div className="mb-4">
            <Container
              style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
            >
              {metVariables.map((param, index) => (
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
                    onValidationChange={handleParamValidation}
                    instancesAsParamsMap={instancesAsParamsMap}
                  ></ParameterFormControllComponent>
                </Container>
              ))}
            </Container>
          </div>
        )}
        {metVariables.length > 0 && <p>{")"}</p>}
        {/* Hier letzte methoden Rückgaben */}
        {methodResults && (
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
                value={methodResults as string}
              />
            </Form.Group>
          </div>
        )}
        <div className="mb-4 text-end">
          <Button variant="primary" type="submit">
            run method
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default InstanceMethodComponent;
