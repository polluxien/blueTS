import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import { FormControl, FormGroup } from "react-bootstrap";
import { useState } from "react";

import type { VSCodeAPIWrapper } from "../../../api/vscodeAPI.ts";

import { validateSubmit } from "../../../helper/validateSubmit.ts";
import type { ValidationTypeResource } from "../../../ressources/frontend/paramResources.ts";
import type { CreateClassInstanceRequestType } from "../../../ressources/request/objectRequest.ts";
import ParameterFormControllComponent from "../../paramComponents/ParameterFormControllComponenet.tsx";
import type { ClassResource } from "../../../ressources/backend/tsCompilerAPIResources.ts";
import type { InstanceResource } from "../../../ressources/classRessources.ts";

type CreateClassInstanceDialogComponentProps = {
  cls: ClassResource;
  close: () => void;
  addToInstanceWaitingList: (instance: InstanceResource) => void;
  vscode: VSCodeAPIWrapper;
  instanceNameSet: React.RefObject<Set<string>>;
  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;
};

function CreateClassInstanceDialogComponent({
  cls,
  close,
  addToInstanceWaitingList,
  vscode,
  instanceNameSet,
  instancesAsParamsMap,
}: CreateClassInstanceDialogComponentProps) {
  const [validated, setValidated] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, Error>>({});

  //form Values before parsing
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  //Validierungsstatus von allen Params
  const [paramValidations, setParamValidations] = useState<
    Record<string, ValidationTypeResource>
  >({});

  const classVariables = cls.constructor?.parameters || [];

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
    console.log("submit pressed");
    
    event.preventDefault();
    event.stopPropagation();

    const { newErrors, newParsedValues } = validateSubmit(
      classVariables,
      paramValidations,
      formValues
    );

    //externe InstanceName Überprüfung
    const instanceName = formValues["__instanceName"];
    if (!instanceName) {
      newErrors["__instanceName"] = new Error("name for instance is required");
    }
    if (instanceNameSet.current.has(instanceName)) {
      newErrors["__instanceName"] = new Error(
        "name for instance is allready used"
      );
    }

    setErrors(newErrors);
    setValidated(true);

    if (Object.keys(newErrors).length === 0) {
      //internes erstellen einer Instanz-Component
      const instRes: InstanceResource = {
        instanceName,
        className: cls.className,
        methods: cls.methods || [],
      };
      addToInstanceWaitingList(instRes);
      instanceNameSet.current.add(instanceName);

      //zum Prüfen ans Backend
      const constructorParameter = classVariables.map((param) => {
        return newParsedValues[param.paramName];
      });

      const creClsInRes: CreateClassInstanceRequestType = {
        instanceName,
        className: cls.className,
        params: constructorParameter,
        tsFile: cls.tsFile,
      };
      console.log("Create instance with value:", creClsInRes);
      vscode.postMessage([
        {
          command: "createInstance",
          data: creClsInRes,
        },
      ]);
    } else {
      console.log(JSON.stringify(errors, null, 2));
    }
  }

  return (
    <Modal show={true} onHide={close} size="lg" centered>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>create instance: {cls.className}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
          {
            <p>
              new {cls.className + "(" + (classVariables.length > 0 ? "" : ")")}
            </p>
          }
          {classVariables.length > 0 && (
            <div className="mb-4">
              <Container
                style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
              >
                {classVariables.map((param, index) => (
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
          <p>{classVariables.length > 0 ? ")" : ""}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" type="button" onClick={close}>
            Close
          </Button>
          <Button variant="primary" type="submit">
            create instance
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default CreateClassInstanceDialogComponent;
