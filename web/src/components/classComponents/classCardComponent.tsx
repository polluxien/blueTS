import type { ClassRessource, InstanceRessource } from "../../ressources/classRessources.ts";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useState } from "react";
import type { VSCodeAPIWrapper } from "../../api/vscodeAPI.ts";
import CreateClassDialogComponent from "./createClassDialogComponent.tsx";

function ClassCardComponent({
  cls,
  addToInstanceWaitingList,
  vscode
}: {
  cls: ClassRessource;
  addToInstanceWaitingList: (instance: InstanceRessource) => void;
  vscode: VSCodeAPIWrapper
}) {
  const [classDialogOpen, setClassDialogOpen] = useState<boolean>(false);

  const openDialog = () => setClassDialogOpen(true);
  const closeDialog = () => setClassDialogOpen(false);

  return (
    <>
      <Card
        bg="secondary"
        text="white"
        className="mb-2"
        style={{ width: "12rem" }}
      >
        <Card.Body>
          <Card.Title>{cls.className}</Card.Title>
          <Button variant="light" size="sm" onClick={openDialog}>
            create instance
          </Button>
        </Card.Body>
        <Card.Footer className="text-muted">
          file: <i>{cls.tsFile?.name}</i>
        </Card.Footer>
      </Card>
      {classDialogOpen && (
        <CreateClassDialogComponent
          cls={cls}
          close={closeDialog}
          addToInstanceWaitingList={addToInstanceWaitingList}
          vscode={vscode}
        ></CreateClassDialogComponent>
      )}
    </>
  );
}

export default ClassCardComponent;
