import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { useState } from "react";

import type {
  MethodRessource,
  RunMethodeInInstanceType,
} from "../../ressources/classRessources.ts";

import { validateFormControllType } from "../../helper/validateType.ts";
import ParameterFormControllComponent, {
  type ValidationTypeResource,
} from "../paramComponents/ParameterFormControllComponenet.tsx";
import { Badge } from "react-bootstrap";
import type { VSCodeAPIWrapper } from "../../api/vscodeAPI.ts";

function InstanceMethodComponent({
  met,
  insName,
  close,
  vscode,
}: {
  met: MethodRessource;
  insName: string;
  close: () => void;
  vscode: VSCodeAPIWrapper;
}) {
  const [validated, setValidated] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, Error>>({});

  //form Values before parsing
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  //Validierungsstatus von allen Params
  const [paramValidations, setParamValidations] = useState<
    Record<string, ValidationTypeResource>
  >({});

  const metVariables = met.parameters || [];

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

    const newErrors: Record<string, Error> = {};
    const newParsedValues: Record<string, unknown> = {};

    const instanceName = formValues["__instanceName"];
    if (!instanceName) {
      newErrors["__instanceName"] = new Error("name is required");
    }

    for (const param of metVariables) {
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
      //hier logik für Methode

      //zum Prüfen ans Backend
      const metParameter = met.parameters.map((param) => {
        return newParsedValues[param.paramName];
      });

      const runMethodeInInstanceType: RunMethodeInInstanceType = {
        instanceName: insName,
        methodName: met.methodName,
        params: metParameter,
        specs: { methodKind: met.specs.methodKind, isAsync: met.specs.isAsync },
      };
      console.log(
        `run ${met.methodName} in instance ${insName} with value: ${runMethodeInInstanceType}`
      );

      vscode.postMessage({
        command: "runMethod",
        data: runMethodeInInstanceType,
      });
    }
  }

  return (
    <>
      {/* Hier sind die ganzen specs Aufgelistet als tags zur  info */}
      <div className="d-flex flex-wrap gap-2">
        {met.specs.isStatic && <Badge bg="dark">static</Badge>}
        {met.specs.isAbstract && <Badge bg="dark">abstract</Badge>}
        {met.specs.isAsync && <Badge bg="dark"> async</Badge>}
        <Badge bg="dark">{met.specs.visibility}</Badge>
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
                    padding: "1.5rem",
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
                  ></ParameterFormControllComponent>
                </Container>
              ))}
            </Container>
          </div>
        )}
        {metVariables.length > 0 && <p>{")"}</p>}
        {/* // ! Hier methoden Rückgabe, muss noch implementiert werden */}
        <Modal.Footer>
          {/** // ! close sollte nicht ganzen dialog schließen  */}
          <Button variant="secondary" type="button" onClick={close}>
            Close
          </Button>
          <Button variant="primary" type="submit">
            run method
          </Button>
        </Modal.Footer>
      </Form>
    </>
  );
}

export default InstanceMethodComponent;
