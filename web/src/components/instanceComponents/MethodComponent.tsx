import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Carousel from "react-bootstrap/Carousel";
import Container from "react-bootstrap/Container";
import { useState } from "react";

import type { MethodRessource } from "../../ressources/classRessources.ts";

import { validateFormControllType } from "../../helper/validateType.ts";
import ParameterFormControllComponent, {
  type ValidationTypeResource,
} from "../paramComponents/ParameterFormControllComponenet.tsx";

function MethodComponent({
  met,
  close,
}: //vscode,
{
  met: MethodRessource;
  close: () => void;
  //vscode: VSCodeAPIWrapper;
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
    }
  }

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {<p>new {met.methodName + "("}</p>}
      {metVariables.length > 0 && (
        <div className="mb-4">
          <Container>
            {metVariables.map((param, index) => (
              <ParameterFormControllComponent
                index={index}
                param={param}
                value={formValues[param.paramName] || ""}
                validated={validated}
                error={errors[param.paramName]}
                onChange={handleChange}
                onValidationChange={handleParameterValidation}
              ></ParameterFormControllComponent>
            ))}
          </Container>
          <Carousel.Caption></Carousel.Caption>
        </div>
      )}
      <p>{")"}</p>
      <Modal.Footer>
        <Button variant="secondary" type="button" onClick={close}>
          Close
        </Button>
        <Button variant="primary" type="submit">
          create instance
        </Button>
      </Modal.Footer>
    </Form>
  );
}

export default MethodComponent;
