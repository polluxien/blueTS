import { Form, FormGroup } from "react-bootstrap";

import type { TypeResource } from "../../ressources/classRessources";
import { useEffect, useState } from "react";
import type { ParamFormTypeResource, ValidationTypeResource } from "../../ressources/frontend/paramResources";
import ParameterFormControllComponent from "./ParameterFormControllComponenet";

function IntersectionParamComponent({
  paramFormType,
}: {
  paramFormType: ParamFormTypeResource;
}) {
  const typeRes: TypeResource = paramFormType.param.typeInfo;

  console.log(typeRes);

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
    // Prüfe ob es intersection values
    if (!typeRes.intersectionValues) return;

    // Iteriere über intersectionValues und checke ob alle valid
    const intersectionIsValid =
      typeRes.intersectionValues?.every((_, index) => {
        const validation = paramValidations[getElementName(index)];
        // Hier müssten Sie prüfen, ob das Element optional ist
        return validation && validation.isValid;
      }) ?? false;

    // Sammle alle Errors
    const allErrors = Object.values(paramValidations).flatMap(
      (value) => value.errors
    );

    // Über Record object erstellen für intersection types
    const myIntersectionValues: unknown[] = [];
    typeRes.intersectionValues?.forEach((_, index) => {
      const validation = paramValidations[getElementName(index)];
      if (validation && validation.isValid && validation.parsedValue) {
        myIntersectionValues[index] = validation.parsedValue;
      }
    });

    paramFormType.onValidationChange!(paramFormType.param.paramName, {
      isValid: intersectionIsValid,
      errors: allErrors,
      parsedValue: myIntersectionValues,
    });
  }, [paramValidations, typeRes.intersectionValues]);

  const getElementName = (elementIndex: number) => {
    return `${paramFormType.param.paramName}[${elementIndex}]`;
  };

  return (
    <FormGroup key={paramFormType.index}>
      <Form.Label>
        <strong>{paramFormType.param.paramName}</strong>
        {paramFormType.param.isOptional && "?"}:{" "}
        {paramFormType.param.typeInfo.typeAsString}
      </Form.Label>
      {typeRes.intersectionValues && (
        <div
          className="mb-4"
          style={{
            backgroundColor: "#faffdeff",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <p>{"{"}</p>
          {/* // * Default case */}
          {typeRes.intersectionValues.map((interParam, i) => (
            <div key={i}>
              <ParameterFormControllComponent
                index={i}
                param={{
                  ...paramFormType.param,
                  typeInfo: interParam,
                  paramName: getElementName(i),
                }}
                formValue={internValues[getElementName(i)] || ""}
                validated={paramFormType.validated}
                error={paramValidations[getElementName(i)]?.errors[0]}
                onValidationChange={handleChildChange}
                onChange={handelInternChange}
                hideLabel={true}
                instancesAsParamsMap={paramFormType.instancesAsParamsMap}
              />
              {i < typeRes.intersectionValues!.length - 1 && (
                <span className="intersection-separator"> & </span>
              )}
            </div>
          ))}
          <p>{"}"}</p>
        </div>
      )}
    </FormGroup>
  );
}

export default IntersectionParamComponent;
