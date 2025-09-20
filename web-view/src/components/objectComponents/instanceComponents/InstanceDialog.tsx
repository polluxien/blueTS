import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import type { InstanceResource } from "../../../ressources/classRessources.js";
import { Accordion, Alert, Table } from "react-bootstrap";
import type { VSCodeAPIWrapper } from "../../../api/vscodeAPI.js";
import InstanceMethodComponent from "./InstanceRunMethodComponent.js";

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
        {ins.props && ins.props.length > 0 ? (
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
              {ins.props.map((prop, i) => (
                <tr key={i}>
                  <td>
                    {prop.name}: {prop.type}{" "}
                  </td>
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
                <Accordion.Header>{method.methodName} </Accordion.Header>
                <Accordion.Body>
                  <InstanceMethodComponent
                    met={method}
                    insName={ins.instanceName}
                    vscode={vscode}
                    methodResults={
                      methodResults
                        ? methodResults?.[
                            `${method.methodName}.${method.specs.methodKind}`
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
