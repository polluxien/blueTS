import type { TypeResource } from "../../ressources/classRessources";
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

import { useEffect, useMemo, useState } from "react";

function UnionParamComponent({
  paramFormType,
}: {
  paramFormType: ParamFormTypeResource;
}) {
  const typeRes: TypeResource = paramFormType.param.typeInfo;
  const [internValues, setInternValues] = useState<Record<string, string>>({});
  const [selectedUnionType, setSelectedUnionType] =
    useState<TypeResource | null>(null);

  const [paramValidations, setParamValidations] = useState<
    Record<string, ValidationTypeResource>
  >({});

  const paramName = paramFormType.param.paramName;

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

    //Fallback null
    const parsedValue = paramValidations[paramName]
      ? paramValidations[paramName].parsedValue
      : null;

    paramFormType.onValidationChange!(paramName, {
      isValid: allErrors.length === 0,
      errors: allErrors,
      parsedValue,
    });
  }, [
    paramValidations,
    selectedUnionType,
    paramFormType.param.paramName,
    paramFormType.onValidationChange!,
  ]);

  //die Unions beeinflussen sich gegenseitig wenn zu viele vorkommen
  const uniqueId = useMemo(
    () => `_${paramFormType.param.paramName}_${Date.now()}`,
    [paramFormType.param.paramName]
  );

  return (
    <FormGroup key={paramFormType.index}>
      <Form.Label>
        <strong>{paramFormType.param.paramName}</strong>
        {paramFormType.param.optional && "?"}:{" "}
        {paramFormType.param.typeInfo.typeAsString}
      </Form.Label>
      <ToggleButtonGroup
        type="radio"
        /* ich hoffe damit genug einzigartigkeit */
        name={uniqueId}
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
        {typeRes.unionValues?.map((type, i) => (
          <ToggleButton
            key={`${uniqueId}_${i}`}
            id={`${uniqueId}_${type.typeAsString}_${i}`}
            value={type.typeAsString}
            variant="outline-primary"
          >
            {type.typeAsString}
          </ToggleButton>
        ))}{" "}
        {/* weil Feld noch ohne auswahl von unionType noch nicht gerendert ist eine valiedierung hier */}
        {!selectedUnionType &&
          !paramFormType.param.optional &&
          paramFormType.validated && (
            <div className="invalid-feedback d-block">
              Selecting a type is required
            </div>
          )}
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
          instancesAsParamsMap={paramFormType.instancesAsParamsMap}
        />
      )}
    </FormGroup>
  );
}

export default UnionParamComponent;
