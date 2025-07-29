import { useState } from "react";
import type {
  ParameterRessource,
  TypeRessource,
} from "../../ressources/classRessources";
import { Form, FormGroup } from "react-bootstrap";
import ParameterFormControllComponent, {
  type ParamFormType,
} from "./ParameterFormControllComponenet";

function UnionParameterFormControllComponent({
  paramFormType,
}: {
  paramFormType: ParamFormType;
}) {
  const typeRes: TypeRessource = paramFormType.param.typeInfo;

  const [selectedUnionType, setSelectedUnionType] =
    useState<TypeRessource | null>(null);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const selectedType = typeRes.unionValues?.find(
      (unionType) => unionType.typeAsString === selectedValue
    );

    if (selectedType) {
      setSelectedUnionType(selectedType);
      paramFormType.onChange(paramFormType.param.paramName, selectedValue);
    } else {
      setSelectedUnionType(null);
    }
  };

  return (
    <FormGroup key={paramFormType.index}>
      {getFormLabel(paramFormType.param)}
      <Form.Select
        required={!paramFormType.param.optional}
        value={paramFormType.value || ""}
        onChange={handleSelectChange}
        isInvalid={paramFormType.validated && !!paramFormType.error}
      >
        <option value="">select union type</option>
        {typeRes.unionValues!.map((unioTypeValue, i) => (
          <option key={i} value={unioTypeValue.typeAsString}>
            {unioTypeValue.typeAsString}
          </option>
        ))}
      </Form.Select>
      {selectedUnionType && (
        <ParameterFormControllComponent
          index={paramFormType.index}
          param={{
            ...paramFormType.param,
            typeInfo: selectedUnionType,
          }}
          value={""}
          validated={paramFormType.validated}
          error={paramFormType.error}
          onChange={paramFormType.onChange}
        />
      )}{" "}
      <Form.Control.Feedback type="invalid">
        {paramFormType.error + "elementParam"}
      </Form.Control.Feedback>
    </FormGroup>
  );
}

function getFormLabel(param: ParameterRessource) {
  return (
    <Form.Label>
      <strong>{param.paramName}</strong>
      {param.optional && "?"}: {param.typeInfo.typeAsString}
    </Form.Label>
  );
}

export default UnionParameterFormControllComponent;
