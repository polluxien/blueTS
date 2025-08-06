import type { InstanceRessource } from "../../ressources/classRessources";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useState } from "react";
import InstanceDialogComponent from "./InstanceDialog.tsx";
import { PlayFill, Plus } from "react-bootstrap-icons";
import { Col, Row } from "react-bootstrap";
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
        text="white"
        className="h-100 shadow-sm"
        style={{
          //width: "280px",
          background: "#cfb98b",
          borderRadius: "16px",
          border: "none",
          width: "100%",
        }}
      >
        <Card.Body>
          <Card.Title>
            {ins.instanceName}: {ins.className}
          </Card.Title>
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
        <Card.Footer></Card.Footer>
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
