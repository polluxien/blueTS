import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { useContext, useState } from "react";
import InstanceDialogComponent from "./InstanceDialog.tsx";
import { Info, Trash } from "react-bootstrap-icons";
import { Col, Row } from "react-bootstrap";
import type { InstanceResource } from "../../../ressources/frontend/instanceTypes.ts";
import { VscodeContext } from "../../../api/vscodeAPIContext.ts";
// import type { VSCodeAPIWrapper } from "../../api/vscodeAPI.ts";

type InstanceCardComponentProps = {
  ins: InstanceResource;

  methodResults: Record<string, string | Error> | undefined;
  instancesAsParamsMap: React.RefObject<Map<string, string[]>>;

  dropInstance: (insName: string) => void;
};

function InstanceCardComponent({
  ins,
  methodResults,
  instancesAsParamsMap,
  dropInstance,
}: InstanceCardComponentProps) {
  const vscode = useContext(VscodeContext);

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
          background: "#306874",
          borderRadius: "16px",
          border: "none",
          width: "100%",
        }}
      >
        <Card.Body>
          <Card.Title>
            {ins.instanceName}: {ins.className}{" "}
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
                onClick={deleteInstance}
              >
                <>
                  <Trash className="me-2" />
                  delete
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
            background: "#304674",
          }}
        ></Card.Footer>
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
