import Form from "react-bootstrap/Form";
import {
  Dropdown,
  DropdownButton,
  FormControl,
  FormGroup,
  InputGroup,
} from "react-bootstrap";
import { useState } from "react";

import type {
  ParameterRessource,
  TypeRessource,
} from "../../ressources/classRessources";

function ParameterFormControllComponent({
  index,
  param,
  value,
  validated,
  error,
  onChange,
}: {
  index: number;
  param: ParameterRessource;
  value: string;
  validated: boolean;
  error?: Error;
  onChange: (paramName: string, value: string) => void;
}) {
  //Union Type selected Value
  const [selectedUnionType, setSelectedUnionType] = useState<string | null>(
    null
  );

  const handleSelectDropdownUnion = (value: string) => {
    setSelectedUnionType(value);
    //bei typänderung clear value
    onChange(param.paramName, "");
  };

  const typeRes: TypeRessource = param.typeInfo;

  if (typeRes.paramType == "union") {
    return (
      <FormGroup key={index}>
        {getFormLabel(param)}

        <InputGroup className="mb-3">
          <DropdownButton
            drop="up"
            variant="outline-secondary"
            title={selectedUnionType ?? "select typ"}
            id={`input-group-dropdown-${index}`}
          >
            {typeRes.unionValues &&
              typeRes.unionValues.map((unionType, idx) => (
                <Dropdown.Item
                  key={idx}
                  onClick={() =>
                    handleSelectDropdownUnion(unionType.typeAsString)
                  }
                >
                  {unionType.typeAsString}
                </Dropdown.Item>
              ))}
          </DropdownButton>

          <Form.Control
            type="text"
            isInvalid={!!error}
            disabled={!selectedUnionType}
          />
          <Form.Control.Feedback type="invalid">
            {error + ""}
          </Form.Control.Feedback>
        </InputGroup>
      </FormGroup>
    );
  }

  if (typeRes.paramType === "enum") {
    return (
      <FormGroup key={index}>
        {getFormLabel(param)}
        <Form.Select
          required={!param.optional}
          value={value}
          onChange={(e) => onChange(param.paramName, e.target.value)}
          isInvalid={validated && !!error}
        >
          <option value="">select enum value</option>
          {typeRes.enumValues?.map((enumValue, i) => (
            <option key={i} value={enumValue}>
              {typeRes.typeAsString + "." + enumValue}
            </option>
          ))}
        </Form.Select>
        <Form.Control.Feedback type="invalid">
          {error?.message || "This field is required"}
        </Form.Control.Feedback>
      </FormGroup>
    );
  }

  if (typeRes.paramType === "void" || typeRes.paramType === "never") {
    return (
      <FormGroup key={index}>
        {getFormLabel(param)}
        <FormControl
          type="text"
          required={!param.optional}
          placeholder="undefined"
          value={"undefined"}
          disabled
          isInvalid={validated}
        />
        <Form.Control.Feedback type="invalid">
          {error?.message || "This field is required"}
        </Form.Control.Feedback>
      </FormGroup>
    );
  }

  return (
    <FormGroup key={index}>
      {getFormLabel(param)}
      <FormControl
        type="text"
        required={!param.optional}
        value={value}
        onChange={(e) => onChange(param.paramName, e.target.value)}
        isInvalid={validated && !!error}
      />
      <Form.Control.Feedback type="invalid">
        {error?.message || "This field is required"}
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

export default ParameterFormControllComponent;
