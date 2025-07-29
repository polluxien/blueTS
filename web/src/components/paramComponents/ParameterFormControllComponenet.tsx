import Form from "react-bootstrap/Form";
import { FormControl, FormGroup } from "react-bootstrap";

import type {
  ParameterRessource,
  TypeRessource,
} from "../../ressources/classRessources";
import ArrayParameterComponent from "./ArrayParamComponent";
import UnionParameterFormControllComponent from "./UnionParamComponent";
import ObjectParamComponent from "./ObjectParamComponent";

export type ParamFormType = {
  index: number;
  param: ParameterRessource;
  value: string;
  validated: boolean;
  error?: Error;
  onChange: (paramName: string, value: string) => void;
};

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
  const typeRes: TypeRessource = param.typeInfo;

  const paramFormType: ParamFormType = {
    index,
    param,
    value,
    validated,
    error,
    onChange,
  };

  if (typeRes.paramType == "union") {
    return (
      <UnionParameterFormControllComponent
        paramFormType={paramFormType}
      ></UnionParameterFormControllComponent>
    );
  }

  if (typeRes.paramType == "tuple") {
    return (
      <></>
      /*
      <UnionParameterFormControllComponent
        paramFormType={paramFormType}
      ></UnionParameterFormControllComponent>
          */
    );
  }

  if (typeRes.paramType === "object") {
    return (
      <ObjectParamComponent
        paramFormType={paramFormType}
      ></ObjectParamComponent>
    );
  }

  if (typeRes.paramType === "array") {
    return (
      <ArrayParameterComponent
        paramFormType={paramFormType}
      ></ArrayParameterComponent>
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

  if (
    typeRes.paramType === "void" ||
    typeRes.paramType === "never" ||
    typeRes.paramType === "undefined"
  ) {
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
      {param.optional && "?"}:{" "}
      {param.typeInfo.paramType === "object"
        ? "{"
        : param.typeInfo.typeAsString}
    </Form.Label>
  );
}

export default ParameterFormControllComponent;
