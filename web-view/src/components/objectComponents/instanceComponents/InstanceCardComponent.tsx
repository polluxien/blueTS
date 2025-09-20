import type { InstanceResource } from "../../../ressources/classRessources.ts";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useState } from "react";
import InstanceDialogComponent from "./InstanceDialog.tsx";
import { Info, X } from "react-bootstrap-icons";
import { Col, Row } from "react-bootstrap";
import type { VSCodeAPIWrapper } from "../../../api/vscodeAPI.ts";
// import type { VSCodeAPIWrapper } from "../../api/vscodeAPI.ts";

type InstanceCardComponentProps = {
  ins: InstanceResource;
  vscode: VSCodeAPIWrapper;
  methodResults: Record<string, string | Error> | undefined;
  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;

  dropInstance: (insName: string) => void;
};

function InstanceCardComponent({
  ins,
  vscode,
  methodResults,
  instancesAsParamsMap,
  dropInstance,
}: InstanceCardComponentProps) {
  const [instanceDialogOpen, setInstanceDialogOpen] = useState<boolean>(false);

  const openDialog = () => setInstanceDialogOpen(true);
  const closeDialog = () => setInstanceDialogOpen(false);

  const deleteInstance = () => {
    //entferne instance aus backend instanceMap
    vscode.postMessage([
      {
        command: "deleteInstance",
        data: ins.instanceName,
      },
    ]);
    //entferne instance aus frontend
    dropInstance(ins.instanceName);
  };

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
            {ins.instanceName}: {ins.className}{" "}
            <Button
              onClick={deleteInstance}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "1.7rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              aria-label="Delete"
            >
              <X />
            </Button>
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
                  <Info className="me-2" />
                  inspect
                </>
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      {instanceDialogOpen && (
        <InstanceDialogComponent
          ins={ins}
          close={closeDialog}
          vscode={vscode}
          methodResults={methodResults}
          instancesAsParamsMap={instancesAsParamsMap}
        ></InstanceDialogComponent>
      )}
    </>
  );
}

export default InstanceCardComponent;
