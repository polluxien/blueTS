import { Form, FormGroup } from "react-bootstrap";
import ParameterFormControllComponent, {
  type ParamFormTypeResource,
  type ValidationTypeResource,
} from "./ParameterFormControllComponenet";
import type { TypeResource } from "../../ressources/classRessources";
import { useEffect, useState } from "react";

function ObjectParamComponent({
  paramFormType,
}: {
  paramFormType: ParamFormTypeResource;
}) {
  const typeRes: TypeResource = paramFormType.param.typeInfo;
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
    if (!typeRes.objectParameters) return;

    //iterier über objParams und checke ob alle valid
    const objIsValid =
      typeRes.objectParameters?.every((objParam) => {
        const validation = paramValidations[objParam.paramName];
        // Optional parameters sind automatisch valid wenn leer
        return objParam.isOptional || (validation && validation.isValid);
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

    paramFormType.onValidationChange!(paramFormType.param.paramName, {
      isValid: objIsValid,
      errors: allErrors,
      parsedValue: myObject,
    });
  }, [paramValidations]);

  return (
    <FormGroup key={paramFormType.index}>
      <Form.Label>
        <strong>{paramFormType.param.paramName}</strong>
        {paramFormType.param.isOptional&& "?"}:{" "}
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
          {/* // * Specal Case beim übergeben eines leeren objects als param -> {} */}
          {typeRes.objectParameters.length === 0 && (
            <div key={0}>
              <ParameterFormControllComponent
                index={0}
                param={{
                  paramName: `${typeRes.typeAsString}_BLANKTYPE`,
                  typeInfo: {
                    paramType: "basic",
                    typeAsString: "emptyObjectType",
                  },
                  isOptional: paramFormType.param.isOptional,
                }}
                value={internValues[`${typeRes.typeAsString}_BLANKTYPE`] || ""}
                validated={paramFormType.validated}
                error={
                  paramValidations[`${typeRes.typeAsString}_BLANKTYPE`]
                    ?.errors[0]
                }
                onChange={handelInternChange}
                onValidationChange={handleChildChange}
                instancesAsParamsMap={paramFormType.instancesAsParamsMap}
                hideLabel={true}
              />
            </div>
          )}
          {/* // * Default case */}
          {typeRes.objectParameters.map((objParam, i) => (
            <div key={i}>
              <ParameterFormControllComponent
                index={i}
                param={objParam}
                value={internValues[objParam.paramName] || ""}
                instancesAsParamsMap={paramFormType.instancesAsParamsMap}
                validated={paramFormType.validated}
                error={paramValidations[objParam.paramName]?.errors[0]}
                onChange={handelInternChange}
                onValidationChange={handleChildChange}
              />
            </div>
          ))}
          <p>{"}"}</p>
        </div>
      )}
    </FormGroup>
  );
}

export default ObjectParamComponent;
