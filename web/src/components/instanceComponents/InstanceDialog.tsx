import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import type { InstanceRessource } from "../../ressources/classRessources.js";
import { Accordion } from "react-bootstrap";
import InstanceMethodComponent from "./InstanceMethodComponent.js";
//import type { VSCodeAPIWrapper } from "../../api/vscodeAPI.js";

function InstanceDialogComponent({
  ins,
  close,
}: //addToInstanceWaitingList,
//vscode,
{
  ins: InstanceRessource;
  close: () => void;
  //addToInstanceWaitingList: (instance: InstanceRessource) => void;
  //vscode: VSCodeAPIWrapper;
}) {
  return (
    <Modal show={true} onHide={close} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{ins.instanceName}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* hier werden die Variablen im inspect angezeigt */}

        {/* hier werden die ausführbaren Methoden angezeigt */}
        {ins.methods.length > 0 && (
          <Accordion>
            {ins.methods.map((method, i) => (
              <Accordion.Item eventKey={i + ""}>
                <Accordion.Header>{method.methodName} </Accordion.Header>
                <Accordion.Body>
                  <InstanceMethodComponent
                    met={method}
                    insName={ins.instanceName}
                    close={close}
                  ></InstanceMethodComponent>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
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
