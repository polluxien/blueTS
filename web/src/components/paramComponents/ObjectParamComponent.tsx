import { Form, FormGroup } from "react-bootstrap";
import ParameterFormControllComponent, {
  type ParamFormType,
} from "./ParameterFormControllComponenet";
import type {
  ParameterRessource,
  TypeRessource,
} from "../../ressources/classRessources";

function ObjectParamComponent({
  paramFormType,
}: {
  paramFormType: ParamFormType;
}) {
  const typeRes: TypeRessource = paramFormType.param.typeInfo;

  return (
    <FormGroup key={paramFormType.index}>
      {getFormLabel(paramFormType.param)}
      {typeRes.objectParameters && (
        <div
          className="mb-4"
          style={{
            backgroundColor: "#ffeede",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          {typeRes.objectParameters.map((objParam, i) => (
            <div key={i}>
              <ParameterFormControllComponent
                index={i}
                param={objParam}
                value={paramFormType.value}
                validated={paramFormType.validated}
                error={paramFormType.error}
                onChange={paramFormType.onChange}
              />
              <Form.Control.Feedback type="invalid">
                {paramFormType.error?.message || "This field is required"}
              </Form.Control.Feedback>
            </div>
          ))}
        </div>
      )}
      <p>{"}"}</p>
    </FormGroup>
  );
}

export default ObjectParamComponent;

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
