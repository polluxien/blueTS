import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import type {
  ClassRessource,
  //CreateClassInstanceRessource,
  InstanceRessource,
} from "../../ressources/classRessources";
import { FormControl, FormGroup } from "react-bootstrap";
import { useState } from "react";
//import { vscode } from "../../api/vscodeAPI";

function CreateClassDialogComponent({
  cls,
  close,
  addToInstanceWaitingList,
}: {
  cls: ClassRessource;
  close: () => void;
  addToInstanceWaitingList: (instance: InstanceRessource) => void;
}) {
  const classVariables = cls.constructor?.parameters || [];

  const [validated, setValidated] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, Error>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  function handleChange(paramName: string, value: string) {
    setFormValues((prev) => ({ ...prev, [paramName]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    const newErrors: Record<string, Error> = {};

    const instanceName = formValues["__instanceName"];
    if (!instanceName) {
      newErrors["__instanceName"] = new Error("Instance name is required");
    }

    for (const param of classVariables) {
      const value = formValues[param.name];
      const err: Error | null = validateFormControllType(
        param.type,
        value,
        param.optional
      );
      if (err) newErrors[param.name] = err;
    }

    setErrors(newErrors);
    setValidated(true);

    if (Object.keys(newErrors).length === 0) {
      //Zum interenen erstellen einer Instanz-Component
      const instRes: InstanceRessource = {
        instanceName,
        className: cls.className,
        methodes: cls.methodes,
      };
      addToInstanceWaitingList(instRes);

      //zum Prüfen ans Backend
      /*
      const constructorParameter = classVariables.map((param) => {
        return formValues[param.name];
      });

      const creClsInRes: CreateClassInstanceRessource = {
        instanceName,
        className: cls.className,
        tsFile: cls.tsFile,
        constructorParameter,
      };
      console.log("Create instance with values:", creClsInRes);
      vscode.postMessage({
        command: "createInstance",
        data: creClsInRes,
      });
      */
    }
  }

  const validateFormControllType = (
    paramType: string,
    formValue: string,
    optional: boolean = false
  ) => {
    if (!formValue && !optional) {
      return new Error("This field is required");
    }
    //Typvalidierung
    console.log(paramType, formValue);
    return null;
  };

  return (
    <Modal show={true} onHide={close} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>create instance: {cls.className}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Class {cls.className} (
          {classVariables && classVariables.length > 0
            ? classVariables.map((param) => param.name).join(", ")
            : ""}
          )
        </p>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <FormGroup key={0}>
            <Form.Label> Name of Instance</Form.Label>
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
          </FormGroup>

          {classVariables &&
            classVariables.length > 0 &&
            classVariables.map((param, index) => (
              <FormGroup key={index + 1}>
                <Form.Label>
                  {param.name}: {param.type}
                  {param.optional && "?"}
                </Form.Label>
                <FormControl
                  type="text"
                  required={!param.optional}
                  value={formValues[param.name] || ""}
                  onChange={(e) => handleChange(param.name, e.target.value)}
                  isInvalid={validated && !!errors[param.name]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[param.name]?.message || "This field is required"}
                </Form.Control.Feedback>
              </FormGroup>
            ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" type="button" onClick={close}>
          Close
        </Button>
        <Button variant="primary" type="submit">
          create Class
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CreateClassDialogComponent;
