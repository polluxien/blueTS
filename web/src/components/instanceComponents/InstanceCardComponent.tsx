import type { InstanceRessource } from "../../ressources/classRessources";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useState } from "react";
import InstanceDialogComponent from "./InstanceDialog.tsx";
// import type { VSCodeAPIWrapper } from "../../api/vscodeAPI.ts";

function InstanceCardComponent({
  ins,
}: // vscode,
{
  ins: InstanceRessource;
  // vscode: VSCodeAPIWrapper;
}) {
  const [instanceDialogOpen, setInstanceDialogOpen] = useState<boolean>(false);

  const openDialog = () => setInstanceDialogOpen(true);
  const closeDialog = () => setInstanceDialogOpen(false);

  return (
    <>
      <Card
        bg="primary"
        text="white"
        className="mb-2"
        style={{ width: "12rem" }}
      >
        <Card.Body>
          <Card.Title>
            {ins.instanceName}: {ins.className}
          </Card.Title>
          <Button variant="light" size="sm" onClick={openDialog}>
            create instance
          </Button>
        </Card.Body>
      </Card>
      {instanceDialogOpen && (
        <InstanceDialogComponent
          ins={ins}
          close={closeDialog}
        ></InstanceDialogComponent>
      )}
    </>
  );
}

export default InstanceCardComponent;
