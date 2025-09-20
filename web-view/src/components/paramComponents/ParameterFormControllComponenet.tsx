import Form from "react-bootstrap/Form";
import { FormControl, FormGroup } from "react-bootstrap";

import type {
  ParameterResource,
  TypeResource,
} from "../../ressources/classRessources.ts";

import ArrayParameterComponent from "./ArrayParamComponent.tsx";
import UnionParamComponent from "./UnionParamComponent.tsx";
import TupelParamComponent from "./TupelParamComponent.tsx";
import { useEffect, useState } from "react";
import { validateFormControllType } from "../../helper/validateType.ts";
import ObjectParamComponent from "./ObjectParamComponent.tsx";
import IntersectionParamComponent from "./IntersectionFormControllComponenet.tsx";
import type { ParamFormTypeResource, ValidationTypeResource } from "../../ressources/frontend/paramResources.ts";

function ParameterFormControllComponent({
  index,
  param,
  formValue: value,
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

  // für feste Typen
  const fixedTypes = ["null", "void", "never", "literal"];

  useEffect(
    () => {
      if (!fixedTypes.includes(typeRes.paramType)) return;

      let expectedValue = "";

      if (typeRes.paramType === "null") expectedValue = "null";
      else if (typeRes.paramType === "void") expectedValue = "undefined";
      else if (typeRes.paramType === "never") expectedValue = "never";
      else if (typeRes.paramType === "literal")
        expectedValue = typeRes.typeAsString;

      // nur setzen, wenn sich Wert unterscheidet
      if (expectedValue && value !== expectedValue) {
        onChange(param.paramName, expectedValue);
        return;
      }

      const { err, parsedValue } = validateFormControllType(param, value);

      onValidationChange!(param.paramName, {
        isValid: !err,
        errors: err ? [err] : [],
        parsedValue,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, typeRes.paramType, typeRes.typeAsString, param.paramName]
  );

  const nestedTypes = ["union", "tuple", "object", "array"];

  //Nested types -> externe überprüfung schon stattgefunden und muss nur übernommen werden
  useEffect(
    () => {
      if (!onValidationChange || !nestedTypes.includes(typeRes.paramType))
        return;
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
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [paramValidations, param.paramName, typeRes.paramType]
  );

  //Basic/primitiv oder enum types -> hier interene Überprüfung
  useEffect(
    () => {
      if (!onValidationChange || nestedTypes.includes(typeRes.paramType))
        return;
      //console.log("primitive type");

      const { err, parsedValue } = validateFormControllType(param, value);

      onValidationChange(param.paramName, {
        isValid: !err,
        errors: err ? [err] : [],
        parsedValue,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, param.paramName, typeRes.paramType]
  );

  const paramFormType: ParamFormTypeResource = {
    index,
    param,
    formValue: value,
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
        {param.isOptional && "?"}: {param.typeInfo.typeAsString}
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

    case "intersection": {
      return (
        <IntersectionParamComponent
          paramFormType={paramFormType}
        ></IntersectionParamComponent>
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
            required={!param.isOptional}
            value={value}
            onChange={(e) => onChange(param.paramName, e.target.value)}
            isInvalid={validated && !!error}
          >
            <option value="">select enum value</option>
            {typeRes.enumMembers?.map((enumValue, i) => (
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
      if (hasNoInstances && !param.isOptional) {
        feedbackMessage = `No instances for class: ${typeRes.typeAsString} found and this field is required`;
      } else if (error?.message) {
        feedbackMessage = error.message;
      }
      return (
        <FormGroup key={index}>
          {!hideLabel && getFormLabel(param)}
          <Form.Select
            required={!param.isOptional}
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
            // value={value || placeholder}
            // onChange={() => onChange(param.paramName, typeRes.paramType)}
            readOnly
            isInvalid={validated && !!error}
          />
          <Form.Control.Feedback type="invalid">
            {error?.message}
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
            // value={value || typeRes.typeAsString}
            // onChange={() => onChange(param.paramName, typeRes.typeAsString)}
            readOnly
            isInvalid={validated && !!error}
          />
          <Form.Control.Feedback type="invalid">
            {error?.message}
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
            required={!param.isOptional}
            value={value}
            onChange={(e) => onChange(param.paramName, e.target.value)}
            isInvalid={validated && !!error}
            isValid={validated && !error}
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
