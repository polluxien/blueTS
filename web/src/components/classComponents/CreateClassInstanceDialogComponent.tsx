import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Carousel from "react-bootstrap/Carousel";
import Container from "react-bootstrap/Container";
import { FormControl, FormGroup } from "react-bootstrap";
import { useState } from "react";

import type {
  ClassRessource,
  ConstructorRessource,
  CreateClassInstanceRessource,
  InstanceRessource,
} from "../../ressources/classRessources.ts";

import type { VSCodeAPIWrapper } from "../../api/vscodeAPI.ts";
import { validateFormControllType } from "../../helper/validateType.ts";
import ParameterFormControllComponent, {
  type ValidationTypeResource,
} from "../paramComponents/ParameterFormControllComponenet.tsx";

function CreateClassInstanceDialogComponent({
  cls,
  close,
  addToInstanceWaitingList,
  vscode,
}: {
  cls: ClassRessource;
  close: () => void;
  addToInstanceWaitingList: (instance: InstanceRessource) => void;
  vscode: VSCodeAPIWrapper;
}) {
  const [constructorIndex, setConstructorIndex] = useState(0);
  const [validated, setValidated] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, Error>>({});

  //form Values before parsing
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  //Validierungsstatus von allen Params
  const [paramValidations, setParamValidations] = useState<
    Record<string, ValidationTypeResource>
  >({});

  const constructors: ConstructorRessource[] = cls.constructors || [];
  const currentConstructor = constructors[constructorIndex];
  const classVariables = currentConstructor?.parameters || [];

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

    for (const param of classVariables) {
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
      //internes erstellen einer Instanz-Component
      const instRes: InstanceRessource = {
        instanceName,
        className: cls.className,
        methods: cls.methods || [],
      };
      addToInstanceWaitingList(instRes);

      //zum Prüfen ans Backend
      const constructorParameter = classVariables.map((param) => {
        return newParsedValues[param.paramName];
      });

      const creClsInRes: CreateClassInstanceRessource = {
        instanceName,
        className: cls.className,
        constructorParameter,
        tsFile: cls.tsFile,
      };
      console.log("Create instance with value:", creClsInRes);
      vscode.postMessage({
        command: "createInstance",
        data: creClsInRes,
      });
    }
  }

  return (
    <Modal show={true} onHide={close} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>create instance: {cls.className}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <FormGroup key={0} className="mb-4">
            <Form.Label> name of instance</Form.Label>
            <FormControl
              type="text"
              required
              value={formValues["__instanceName"] || ""}
              onChange={(e) => handleChange("__instanceName", e.target.value)}
              isInvalid={validated && !!errors["__instanceName"]}
            />
            <Form.Control.Feedback type="invalid">
              {errors["__instanceName"]?.message || "Instance name is required"}
            </Form.Control.Feedback>
          </FormGroup>{" "}
          {constructors.length > 1 && (
            <p>Multiple constructors found. Please choose one:</p>
          )}
          {
            //zu groß
            /*         <p>
            constructor(
            {currentConstructor.parameters
              ?.map(
                (param) =>
                  param.paramName +
                  (param.optional ? "?" : "") +
                  ": " +
                  param.typeInfo.typeAsString
              )
              .join(", ")}
            )
          </p>{" "} */
          }
          {<p>new {cls.className + "("}</p>}
          {constructors.length > 0 && (
            <div className="mb-4">
              <Carousel
                activeIndex={constructorIndex}
                onSelect={(selectedIndex) => setConstructorIndex(selectedIndex)}
                slide={false}
                indicators={constructors.length > 1}
                style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
              >
                {constructors.map((constructor, i) => (
                  <Carousel.Item
                    key={i}
                    style={{
                      backgroundColor: "#f7f9fb",
                      padding: "1.5rem",
                      borderRadius: "10px",
                    }}
                  >
                    <Container>
                      {constructor.parameters &&
                        constructor.parameters.map((param, index) => (
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
                  </Carousel.Item>
                ))}
              </Carousel>
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
      </Modal.Body>
    </Modal>
  );
}

export default CreateClassInstanceDialogComponent;
