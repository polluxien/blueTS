import Form from "react-bootstrap/Form";
import { FormControl, FormGroup } from "react-bootstrap";

import type {
  ParameterRessource,
  TypeRessource,
} from "../../ressources/classRessources";

import ArrayParameterComponent from "./ArrayParamComponent.tsx";
import UnionParamComponent from "./UnionParamComponent.tsx";
import TupelParamComponent from "./TupelParamComponent.tsx";
import { useEffect, useState } from "react";
import { validateFormControllType } from "../../helper/validateType.ts";
import ObjectParamComponent from "./ObjectParamComponent.tsx";

export type ParamFormTypeResource = {
  index: number;
  param: ParameterRessource;
  value: string;
  validated: boolean;
  error?: Error;
  onChange: (paramName: string, value: string) => void;
  onValidationChange?: (
    paramName: string,
    validationRes: ValidationTypeResource
  ) => void;
};

export type ValidationTypeResource = {
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
  hideLabel,
}: {
  index: number;
  param: ParameterRessource;
  value: string;
  validated: boolean;
  error?: Error;
  onChange: (paramName: string, value: string) => void;
  onValidationChange?: (
    paramName: string,
    validationRes: ValidationTypeResource
  ) => void;
  hideLabel?: boolean;
}) {
  const typeRes: TypeRessource = param.typeInfo;

  //in components müssden diese überprüften types in richtige syntax gebracht werden

  const [paramValidations, setParamValidations] = useState<
    Record<string, ValidationTypeResource>
  >({});

  function handleChildChange(
    paramName: string,
    validationRes: ValidationTypeResource
  ) {
    setParamValidations((prev) => ({ ...prev, [paramName]: validationRes }));
  }

  //Debugg useEffect
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

  const paramFormType: ParamFormTypeResource = {
    index,
    param,
    value,
    validated,
    error,
    onChange,
    onValidationChange: handleChildChange,
  };

  const getFormLabel = (param: ParameterRessource) => {
    return (
      <Form.Label>
        <strong>{param.paramName}</strong>
        {param.optional && "?"}: {param.typeInfo.typeAsString}
      </Form.Label>
    );
  };

  //----------- !!! -----------------
  switch (typeRes.paramType) {
    case "union": {
      return (
        <UnionParamComponent
          paramFormType={paramFormType}
        ></UnionParamComponent>
      );
    }

    case "tuple": {
      return (
        <TupelParamComponent
          paramFormType={paramFormType}
        ></TupelParamComponent>
      );
    }

    case "array": {
      return (
        <ArrayParameterComponent
          paramFormType={paramFormType}
        ></ArrayParameterComponent>
      );
    }

    case "object": {
      return (
        <ObjectParamComponent
          paramFormType={paramFormType}
        ></ObjectParamComponent>
      );
    }

    case "enum": {
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

    case "void":
    case "never":
    case "null": {
      let placeholder = ""
      if(typeRes.paramType === "null") placeholder = "null"
      if(typeRes.paramType === "void") placeholder = "undefined"
      return (
        <FormGroup key={index}>
          {getFormLabel(param)}
          <FormControl
            type="text"
            placeholder={placeholder}
            disabled
            isInvalid={validated}
          />
          <Form.Control.Feedback type="invalid">
            {error?.message || "This field is required"}
          </Form.Control.Feedback>
        </FormGroup>
      );
    }

    default: {
      return (
        <FormGroup key={index}>
          {!hideLabel && getFormLabel(param)}
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
  }
}

export default ParameterFormControllComponent;
