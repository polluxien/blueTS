import type {
  ClassRessource,
  InstanceRessource,
} from "../../ressources/classRessources.ts";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useState } from "react";
import type { VSCodeAPIWrapper } from "../../api/vscodeAPI.ts";
import CreateClassInstanceDialogComponent from "./CreateClassInstanceDialogComponent.tsx";
import { Col, Row } from "react-bootstrap";

//Bootstrap Icons
import { PlayFill, Plus } from "react-bootstrap-icons"; // Bootstrap Icons

function ClassCardComponent({
  cls,
  addToInstanceWaitingList,
  vscode,
}: {
  cls: ClassRessource;
  addToInstanceWaitingList: (instance: InstanceRessource) => void;
  vscode: VSCodeAPIWrapper;
}) {
  const [classDialogOpen, setClassDialogOpen] = useState<boolean>(false);
  // const [hoveredAdd, setHoveredAdd] = useState(false);
  // const [hoveredRun, setHoveredRun] = useState(false);

  const openDialog = () => setClassDialogOpen(true);
  const closeDialog = () => setClassDialogOpen(false);

  return (
    <>
      <Card
        text="white"
        className="h-100 shadow-sm"
        style={{
          //width: "280px",
          background: "#304674",
          borderRadius: "16px",
          border: "none",
          width: "100%",
        }}
      >
        <Card.Body>
          <Card.Title>{cls.className}</Card.Title>
          <Row className="gap-2">
            <Col>
              <Button
                //w-100 = 100% des cols, gap-2 = abstabnd zwischen icon und text
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                variant="outline-light"
                size="sm"
                style={{
                  height: "44px",
                  borderRadius: "12px",
                  // border: "none",
                }}
                //style={baseStyle(hoveredRun)}
                // onMouseEnter={() => setHoveredRun(true)}
                //  onMouseLeave={() => setHoveredRun(false)}
                onClick={openDialog}
              >
                <>
                  <PlayFill className="me-2" />
                  Check
                </>
              </Button>
            </Col>
            <Col>
              <Button
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                variant="outline-primary"
                size="sm"
                style={{
                  height: "44px",
                  borderRadius: "12px",
                  //border: "none",
                }}
                //style={baseStyle(hoveredAdd)}
                // onMouseEnter={() => setHoveredAdd(true)}
                //  onMouseLeave={() => setHoveredAdd(false)}
                onClick={openDialog}
              >
                <>
                  <Plus className="me-2" /> Add
                </>
              </Button>
            </Col>
          </Row>
        </Card.Body>
        <Card.Footer
          style={{
            border: "none",
            borderBottomLeftRadius: "16px",
            borderBottomRightRadius: "16px",
            background: "#26385D",
          }}
        >
          file: <i>{cls.tsFile?.name}</i>
        </Card.Footer>
      </Card>
      {classDialogOpen && (
        <CreateClassInstanceDialogComponent
          cls={cls}
          close={closeDialog}
          addToInstanceWaitingList={addToInstanceWaitingList}
          vscode={vscode}
        ></CreateClassInstanceDialogComponent>
      )}
    </>
  );
}

export default ClassCardComponent;
