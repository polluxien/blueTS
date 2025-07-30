import type { TypeRessource } from "../../ressources/classRessources";
import {
  Form,
  FormGroup,
  ToggleButton,
  ToggleButtonGroup,
} from "react-bootstrap";
import ParameterFormControllComponent, {
  type ParamFormTypeResource,
  type ValidationTypeResource,
} from "./ParameterFormControllComponenet";

import { useEffect, useState } from "react";

function UnionParamComponent({
  paramFormType,
}: {
  paramFormType: ParamFormTypeResource;
}) {
  const typeRes: TypeRessource = paramFormType.param.typeInfo;
  const [internValues, setInternValues] = useState<Record<string, string>>({});
  const [selectedUnionType, setSelectedUnionType] =
    useState<TypeRessource | null>(null);

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
    //sammle alle Errors
    const allErrors = Object.values(paramValidations).flatMap(
      (value) => value.errors
    );

    paramFormType.onValidationChange!(paramFormType.param.paramName, {
      isValid: allErrors.length === 0,
      errors: allErrors,
      parsedValue: paramValidations,
    });
  }, [
    paramValidations,
    selectedUnionType,
    paramFormType.param.paramName,
    paramFormType.onValidationChange!,
  ]);

  return (
    <FormGroup key={paramFormType.index}>
      <Form.Label>
        <strong>{paramFormType.param.paramName}</strong>
        {paramFormType.param.optional && "?"}:{" "}
        {paramFormType.param.typeInfo.typeAsString}
      </Form.Label>
      <ToggleButtonGroup
        type="radio"
        name={`union-select-${paramFormType.param.paramName}`}
        value={selectedUnionType?.typeAsString || ""}
        onChange={(val: string) => {
          const selectedType = typeRes.unionValues?.find(
            (unionType) => unionType.typeAsString === val
          );
          if (selectedType) {
            setSelectedUnionType(selectedType);
            paramFormType.onChange(paramFormType.param.paramName, val);
          }
        }}
        className="mb-2 d-flex flex-wrap gap-2"
      >
        {typeRes.unionValues?.map((type, idx) => (
          <ToggleButton
            key={`${idx}_${paramFormType.param.paramName}_${paramFormType.index}`}
            id={`union-${type.typeAsString}`}
            value={type.typeAsString}
            variant="outline-primary"
          >
            {type.typeAsString}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {selectedUnionType && (
        <ParameterFormControllComponent
          index={paramFormType.index}
          param={{
            ...paramFormType.param,
            typeInfo: selectedUnionType,
          }}
          value={internValues[paramFormType.param.paramName] || ""}
          validated={paramFormType.validated}
          error={paramFormType.error}
          onChange={handelInternChange}
          onValidationChange={handleChildChange}
          hideLabel={true}
        />
      )}{" "}
      <Form.Control.Feedback type="invalid">
        {paramFormType.error + "elementParam"}
      </Form.Control.Feedback>
    </FormGroup>
  );
}

export default UnionParamComponent;
