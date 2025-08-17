import Form from "react-bootstrap/Form";
import { FormControl, FormGroup } from "react-bootstrap";

import type {
  ParameterResource,
  TypeResource,
} from "../../ressources/classRessources";

import ArrayParameterComponent from "./ArrayParamComponent.tsx";
import UnionParamComponent from "./UnionParamComponent.tsx";
import TupelParamComponent from "./TupelParamComponent.tsx";
import { useEffect, useState } from "react";
import { validateFormControllType } from "../../helper/validateType.ts";
import ObjectParamComponent from "./ObjectParamComponent.tsx";

export type ParamFormTypeResource = {
  index: number;
  param: ParameterResource;
  value: string;
  validated: boolean;
  error?: Error;

  onChange: (paramName: string, value: string) => void;
  onValidationChange?: (
    paramName: string,
    validationRes: ValidationTypeResource
  ) => void;

  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;
  hideLabel?: boolean;
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
  instancesAsParamsMap,
  hideLabel,
}: ParamFormTypeResource) {
  const typeRes: TypeResource = param.typeInfo;

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
      value,
      onValidationChange
    );
  }, [value, param.paramName, param.typeInfo.paramType, onValidationChange]);

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
    if (!paramValidations[param.paramName]) {
      console.error(
        "param zur Validation übergabe konnte nicht gefunden werden"
      );
    }

    onValidationChange(param.paramName, {
      isValid: allChildrenValid,
      errors: allErrors,
      parsedValue: paramValidations[param.paramName]?.parsedValue,
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
    instancesAsParamsMap,
  };

  const getFormLabel = (param: ParameterResource) => {
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
          {!hideLabel && getFormLabel(param)}
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

    case "instance": {
      const classInstanceArr =
        instancesAsParamsMap.current.get(typeRes.typeAsString) || [];

      const hasNoInstances = classInstanceArr.length === 0;
      const showFeedback = validated && (!!error || hasNoInstances);

      let feedbackMessage = "";
      if (hasNoInstances && !param.optional) {
        feedbackMessage = `No instances for class: ${typeRes.typeAsString} found and this field is required`;
      } else if (error?.message) {
        feedbackMessage = error.message;
      }
      return (
        <FormGroup key={index}>
          {!hideLabel && getFormLabel(param)}
          <Form.Select
            required={!param.optional}
            value={value}
            disabled={hasNoInstances}
            onChange={(e) => onChange(param.paramName, e.target.value)}
            isInvalid={validated && !!error}
          >
            <option value="">select instance as value</option>
            {classInstanceArr?.map((instance, i) => (
              <option key={i} value={instance}>
                {instance + ": " + typeRes.typeAsString}
              </option>
            ))}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {showFeedback && feedbackMessage}
          </Form.Control.Feedback>
        </FormGroup>
      );
    }

    case "void":
    case "never":
    case "null": {
      let placeholder = "";
      if (typeRes.paramType === "null") placeholder = "null";
      if (typeRes.paramType === "void") placeholder = "undefined";
      return (
        <FormGroup key={index}>
          {!hideLabel && getFormLabel(param)}
          <FormControl
            type="text"
            placeholder={placeholder}
            value={placeholder}
            onChange={(e) => onChange(param.paramName, e.target.value)}
            disabled
            isInvalid={validated}
          />
          <Form.Control.Feedback type="invalid">
            {error?.message || "This field is required"}
          </Form.Control.Feedback>
        </FormGroup>
      );
    }

    case "literal": {
      return (
        <FormGroup key={index}>
          {!hideLabel && getFormLabel(param)}
          <FormControl
            type="text"
            placeholder={typeRes.typeAsString}
            value={typeRes.typeAsString}
            onChange={(e) => onChange(param.paramName, e.target.value)}
            disabled
            isInvalid={validated || !!error}
          />
          <Form.Control.Feedback type="invalid">
            {error?.message || "This field is required"}
          </Form.Control.Feedback>
        </FormGroup>
      );
    }

    //hier alle basic Param types
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
