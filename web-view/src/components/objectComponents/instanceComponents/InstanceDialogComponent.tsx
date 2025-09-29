import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import { Accordion, Alert, Badge, Table } from "react-bootstrap";
import type { VSCodeAPIWrapper } from "../../../api/vscodeAPI.js";
import InstanceMethodComponent from "./InstanceRunMethodComponent.js";
import type { InstanceResource } from "../../../ressources/frontend/instanceTypes.js";
import type { CompiledPropInstanceType } from "../../../ressources/backend/nodeVMResources.js";
import type { PropertyResource } from "../../../ressources/backend/tsCompilerAPIResources.js";

type InstanceDialogComponentProps = {
  ins: InstanceResource;

  close: () => void;

  methodResults: Record<string, Error | string> | undefined;
  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;

  vscode: VSCodeAPIWrapper;
};
function InstanceDialogComponent({
  ins,
  close,
  vscode,
  methodResults,
  instancesAsParamsMap,
}: InstanceDialogComponentProps) {
  const analyzedProps = ins.properties;

  const getPropInfo = (prop: CompiledPropInstanceType) => {
    const myProp = analyzedProps.find(
      (p) => prop.name === (p as PropertyResource)!.name
    );

    if (!myProp) {
      return (
        <>
          <strong>{prop.name}: </strong> {prop.type}
        </>
      );
    }

    return (
      <>
        {myProp.specs.visibility &&
          myProp.specs.visibility !== "public" &&
          myProp.specs.visibility + " "}
        {myProp.specs.isStatic && "static" + " "}
        {myProp.specs.isReadonly && "readonly" + " "}
        <strong>{myProp.name}: </strong>
        {myProp.type}
      </>
    );
  };

  return (
    <Modal show={true} onHide={close} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {ins.instanceName}: {ins.className}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* hier werden die Variablen im inspect angezeigt */}
        <h5 className="mt-4 mb-3">Instance Properties</h5>
        {ins.compiledProperties && ins.compiledProperties.length > 0 ? (
          <Table
            responsive="sm"
            striped
            bordered
            hover
            className="align-middle text-center"
          >
            {/*   
            <thead className="table-dark">
              <tr>
                <th>name</th>
                <th>type</th>
                <th>value</th>
              </tr>
            </thead>
            */}
            <tbody>
              {ins.compiledProperties.map((prop, i) => (
                <tr key={i}>
                  <td>{getPropInfo(prop)}</td>
                  <td>{prop.value} </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Alert variant="light">
            The class <strong>{ins.className}</strong> has no properties.
          </Alert>
        )}

        {/* hier werden die ausführbaren Methoden angezeigt */}
        <h5 className="mt-4 mb-3">Instance Methods</h5>
        {ins.methods.length > 0 ? (
          <Accordion>
            {ins.methods.map((method, i) => (
              <Accordion.Item eventKey={i + ""}>
                <Accordion.Header>
                  <span className="me-2">{method.methodName}</span>
                  {method.methodKind !== "default" && (
                    <Badge bg="secondary">{method.methodKind}</Badge>
                  )}
                </Accordion.Header>
                <Accordion.Body>
                  <InstanceMethodComponent
                    met={method}
                    insName={ins.instanceName}
                    vscode={vscode}
                    methodResults={
                      methodResults
                        ? methodResults?.[
                            `${method.methodName}.${method.methodKind}`
                          ]
                        : undefined
                    }
                    instancesAsParamsMap={instancesAsParamsMap}
                  ></InstanceMethodComponent>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        ) : (
          <Alert variant="light">
            The class <strong>{ins.className}</strong> has no callable methods.
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" type="button" onClick={close}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default InstanceDialogComponent;
