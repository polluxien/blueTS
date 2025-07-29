import { Form, FormGroup } from "react-bootstrap";
import ParameterFormControllComponent, {
  type ParamFormType,
} from "./ParameterFormControllComponenet";
import type { TypeRessource } from "../../ressources/classRessources";

function ObjectParamComponent({
  paramFormType,
}: {
  paramFormType: ParamFormType;
}) {
  const typeRes: TypeRessource = paramFormType.param.typeInfo;

  return (
    <FormGroup key={paramFormType.index}>
      <Form.Label>
        <strong>{paramFormType.param.paramName}</strong>
        {paramFormType.param.optional && "?"}:{" "}
        {paramFormType.param.typeInfo.typeAsString}
      </Form.Label>
      {typeRes.objectParameters && (
        <div
          className="mb-4"
          style={{
            backgroundColor: "#ffeede",
            borderRadius: "8px",
            padding: "1.5rem",
          }}
        >
          <p>{"{"}</p>
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
          <p>{"}"}</p>
        </div>
      )}
    </FormGroup>
  );
}

export default ObjectParamComponent;
