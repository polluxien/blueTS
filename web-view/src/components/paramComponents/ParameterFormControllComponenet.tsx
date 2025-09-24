import Form from "react-bootstrap/Form";
import { Alert, FormControl, FormGroup } from "react-bootstrap";

import ArrayParameterComponent from "./ArrayParamComponent.tsx";
import UnionParamComponent from "./UnionParamComponent.tsx";
import TupelParamComponent from "./TupelParamComponent.tsx";
import { useEffect, useState } from "react";
import { validateFormControllType } from "../../helper/validateType.ts";
import ObjectParamComponent from "./ObjectParamComponent.tsx";
import IntersectionParamComponent from "./IntersectionFormControllComponenet.tsx";
import type {
  ParamFormTypeResource,
  ValidationTypeResource,
} from "../../ressources/frontend/paramResources.ts";
import type { TypeResource } from "../../ressources/backend/tsCompilerAPIResources.ts";
import GenericParameterComponent from "./GenericParamComponent.tsx";

function ParameterFormControllComponent({
  index,
  param,
  formValue,
  validated,
  error,
  onChange,
  onValidationChange,
  instancesAsParamsMap,
  hideLabel,
}: ParamFormTypeResource) {
  const typeRes: TypeResource = param.typeInfo;

  //in sub-components müssden diese überprüften types in richtige syntax gebracht werden

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
      typeRes.paramType,
      formValue,
      onValidationChange
    );
  }, [formValue, param.paramName, typeRes.paramType, onValidationChange]);

  // für feste Typen von typeAsString
  const fixedTypes = ["null", "void", "never"];

  useEffect(
    () => {
      if (
        !fixedTypes.includes(typeRes.typeAsString) &&
        typeRes.paramType !== "literal"
      ) {
        return;
      }
      const expectedValue = typeRes.typeAsString;

      // nur setzen, wenn sich Wert unterscheidet
      if (formValue !== expectedValue) {
        onChange(param.paramName, expectedValue);
        return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [typeRes.paramType, typeRes.typeAsString, param.paramName]
  );

  //für verschachtelte Typen vom paramType
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

      const { err, parsedValue } = validateFormControllType(param, formValue);

      console.log("primitive type", parsedValue);

      onValidationChange(param.paramName, {
        isValid: !err,
        errors: err ? [err] : [],
        parsedValue,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formValue, param.paramName, typeRes.paramType]
  );

  const paramFormType: ParamFormTypeResource = {
    index,
    param,
    formValue: formValue,
    validated,
    error,
    onChange,
    onValidationChange: handleChildChange,
    instancesAsParamsMap,
  };

  const getFormLabel = () => {
    return (
      <Form.Label>
        <strong>{param.paramName}</strong>
        {param.isOptional && "?"}: {param.typeInfo.typeAsString}
      </Form.Label>
    );
  };

  const getWarningLabel = () => {
    return (
      <Alert variant="warning" dismissible>
        <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
        <p>This Type is kinda supported</p>
      </Alert>
    );
  };

  const getErrorLabel = () => {
    return (
      <Alert variant="danger" dismissible>
        <Alert.Heading>Oh snap! You got an error!</Alert.Heading>
        <p>{typeRes.errorWarning}</p>
      </Alert>
    );
  };

  //----------- !!! -----------------

  // ? Komplexe Typen ----------------------
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

    case "generic": {
      return (
        <GenericParameterComponent
          paramFormType={paramFormType}
        ></GenericParameterComponent>
      );
    }

    // ? -------------------------------------

    // ? Simple Typen ------------------------

    case "enum": {
      return (
        <FormGroup key={index}>
          {!hideLabel && getFormLabel()}
          <Form.Select
            required={!param.isOptional}
            value={formValue}
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
          {!hideLabel && getFormLabel()}
          <Form.Select
            required={!param.isOptional}
            value={formValue}
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

    //feste values
    case "literal":
    case "special-locked": {
      //benötigt kein value oder onChange -> readonly und placeholder
      return (
        <FormGroup key={index}>
          {!hideLabel && getFormLabel()}
          <FormControl
            type="text"
            placeholder={typeRes.typeAsString}
            readOnly
            isInvalid={validated && !!error}
          />
          <Form.Control.Feedback type="invalid">
            {error?.message}
          </Form.Control.Feedback>
        </FormGroup>
      );
    }

    //nicht so ganz supported
    case "function": {
      return (
        <FormGroup key={index}>
          {getWarningLabel()}
          {!hideLabel && getFormLabel()}
          <FormControl
            as="textarea"
            rows={2}
            required={!param.isOptional}
            value={formValue}
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

    //hier alle primive-basics und fallback types
    default: {
      if (typeRes.paramType)
        return (
          <FormGroup key={index}>
            {typeRes.paramType === "fallback" && getErrorLabel()}
            {!hideLabel && getFormLabel()}
            <FormControl
              type="text"
              required={!param.isOptional}
              value={formValue}
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

  // ? -------------------------------------
}

export default ParameterFormControllComponent;
