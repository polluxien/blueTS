import Form from "react-bootstrap/Form";
import { FormControl, FormGroup } from "react-bootstrap";

import type {
  ParameterRessource,
  TypeRessource,
} from "../../ressources/classRessources";

import ArrayParameterComponent from "./ArrayParamComponent.tsx";
import ObjectParamComponent from "./ObjectParamComponent.tsx";
import UnionParamComponent from "./UnionParamComponent.tsx";
import TupelParamComponent from "./TupelParamComponent.tsx";
import { useEffect, useState } from "react";
import { validateFormControllType } from "../../helper/validateType.ts";

export type ParamFormType = {
  index: number;
  param: ParameterRessource;
  value: string;
  validated: boolean;
  error?: Error;
  onChange: (paramName: string, value: string) => void;
};

export type ValidationType = {
  isValid: boolean;
  errors: Error[];
  parsedValue?: unknown;
};

function ParameterFormControllComponent({
  index,
  param,
  value,
  validated,
  error,
  onChange,
  onValidationChange,
}: {
  index: number;
  param: ParameterRessource;
  value: string;
  validated: boolean;
  error?: Error;
  onChange: (paramName: string, value: string) => void;
  onValidationChange?: (
    paramName: string,
    validationInfo: ValidationType
  ) => void;
}) {
  const typeRes: TypeRessource = param.typeInfo;

  //in components müssden diese überprüften types in richtige syntax gebracht werden

  const [paramValidations, setParamValidations] = useState<
    Record<string, ValidationType>
  >({});

  function handleChildChange(
    paramName: string,
    validationType: ValidationType
  ) {
    setParamValidations((prev) => ({ ...prev, [paramName]: validationType }));
  }

  useEffect(() => {
    console.log(
      "Effect triggered for",
      param.paramName,
      param.typeInfo.paramType,
      value
    );
  }, [value, param.paramName, param.typeInfo.paramType]);

  const nestedTypes = ["union", "tuple", "object", "array"];

  //Nested types -> externe überprüfung schon stattgefunden und muss nur übernommen werden
  useEffect(() => {
    if (!onValidationChange || !nestedTypes.includes(typeRes.paramType)) return;
    //console.log("nested type");

    // Noch keine Child-Validierungen erhalten
    if (Object.keys(paramValidations).length === 0) return;

    const allChildrenValid = Object.values(paramValidations).every(
      (value) => value.isValid
    );
    const allErrors = Object.values(paramValidations).flatMap(
      (value) => value.errors
    );

    onValidationChange(param.paramName, {
      isValid: allChildrenValid,
      errors: allErrors,
      parsedValue: paramValidations[param.paramName],
    });
  }, [paramValidations, param.paramName, onValidationChange]);

  //Basic/primitiv oder enum types -> hier interene Überprüfung
  useEffect(() => {
    if (!onValidationChange || nestedTypes.includes(typeRes.paramType)) return;
    //console.log("primitive type");

    const { err, parsedValue } = validateFormControllType(param, value);

    onValidationChange(param.paramName, {
      isValid: !err,
      errors: err ? [err] : [],
      parsedValue,
    });
  }, [value, param.paramName, onValidationChange]);

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
      <UnionParamComponent
        paramFormType={paramFormType}
        // onValidationChange={handleChildChange}
      ></UnionParamComponent>
    );
  }

  if (typeRes.paramType == "tuple") {
    return (
      <TupelParamComponent
        paramFormType={paramFormType}
        // onValidationChange={handleChildChange}
      ></TupelParamComponent>
    );
  }

  if (typeRes.paramType === "object") {
    return (
      <ObjectParamComponent
        paramFormType={paramFormType}
        onValidationChange={handleChildChange}
      ></ObjectParamComponent>
    );
  }

  if (typeRes.paramType === "array") {
    return (
      <ArrayParameterComponent
        paramFormType={paramFormType}
        onValidationChange={handleChildChange}
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
            <option key={i} value={typeRes.typeAsString + "." + enumValue}>
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
      {param.optional && "?"}: {param.typeInfo.typeAsString}
    </Form.Label>
  );
}

export default ParameterFormControllComponent;
