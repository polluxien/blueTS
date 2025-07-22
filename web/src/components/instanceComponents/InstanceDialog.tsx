import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import type { InstanceRessource } from "../../ressources/classRessources.js";
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
      <Modal.Body></Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" type="button" onClick={close}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default InstanceDialogComponent;
