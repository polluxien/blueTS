import { Form, FormGroup } from "react-bootstrap";
import ParameterFormControllComponent, {
  type ParamFormType,
  type ValidationType,
} from "./ParameterFormControllComponenet";
import type { TypeRessource } from "../../ressources/classRessources";
import { useEffect, useState } from "react";

function ObjectParamComponent({
  paramFormType,
  onValidationChange,
}: {
  paramFormType: ParamFormType;
  onValidationChange: (
    paramName: string,
    validationInfo: ValidationType
  ) => void;
}) {
  const typeRes: TypeRessource = paramFormType.param.typeInfo;

  const [paramValidations, setParamValidations] = useState<
    Record<string, ValidationType>
  >({});

  const [internValues, setInternValues] = useState<Record<string, string>>({});

  function handleChildChange(
    paramName: string,
    validationType: ValidationType
  ) {
    setParamValidations((prev) => ({ ...prev, [paramName]: validationType }));
  }

  function handelInternChange(paramName: string, value: string) {
    setInternValues((prev) => ({ ...prev, [paramName]: value }));
  }

  useEffect(() => {
    if (!typeRes.objectParameters) return;

    //iterier über objParams und checke ob alle valid
    const objIsValid =
      typeRes.objectParameters?.every((objParam) => {
        const validation = paramValidations[objParam.paramName];
        // Optional parameters sind automatisch valid wenn leer
        return objParam.optional || (validation && validation.isValid);
      }) ?? false;

    //sammle alle Errors
    const allErrors = Object.values(paramValidations).flatMap(
      (value) => value.errors
    );

    //über Record object erstellen
    const myObject: Record<string, unknown> = {};

    //iterier über objParams und füge an jedem attribute geparsed value ein
    typeRes.objectParameters?.map((objParam) => {
      const validation = paramValidations[objParam.paramName];
      if (validation && validation.isValid && validation.parsedValue) {
        myObject[objParam.paramName] = validation.parsedValue;
      }
    });

    onValidationChange(paramFormType.param.paramName, {
      isValid: objIsValid,
      errors: allErrors,
      parsedValue: myObject,
    });
  }, [paramValidations]);

  return (
    <FormGroup key={paramFormType.index}>
      <Form.Label>
        <strong>{paramFormType.param.paramName}</strong>
        {paramFormType.param.optional && "?"}:{" "}
        {paramFormType.param.typeInfo.typeAsString}
      </Form.Label>
      {typeRes.objectParameters && (
        <div
          className="mb-4"
          style={{
            backgroundColor: "#ffeede",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <p>{"{"}</p>
          {typeRes.objectParameters.map((objParam, i) => (
            <div key={i}>
              <ParameterFormControllComponent
                index={i}
                param={objParam}
                value={internValues[objParam.paramName] || ""}
                validated={paramFormType.validated}
                error={paramValidations[objParam.paramName]?.errors[0]}
                onChange={handelInternChange}
                onValidationChange={handleChildChange}
              />
              <Form.Control.Feedback type="invalid">
                {paramFormType.error?.message || "This field is required"}
              </Form.Control.Feedback>
            </div>
          ))}
          <p>{"}"}</p>
        </div>
      )}
    </FormGroup>
  );
}

export default ObjectParamComponent;
