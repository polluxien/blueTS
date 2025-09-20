import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import type { VSCodeAPIWrapper } from "../api/vscodeAPI";
import { useEffect, useRef, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { Gear } from "react-bootstrap-icons";
import type { DirectoryRespondeType } from "../ressources/response/directoryResponde";

type DirectorySettingsComponentType = {
  currentDirectoryRes: DirectoryRespondeType | undefined;

  vscode: VSCodeAPIWrapper;
};

function DirectorySettingsComponent({
  currentDirectoryRes,
  vscode,
}: DirectorySettingsComponentType) {
  const [directory, setDirectory] = useState<string>();
  const [useDefaultDirectory, setUseDefaultDirectory] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpenDirectorySettings, setIsOpenDirectorySettings] =
    useState<boolean>(false);

  useEffect(() => {
    console.log("sending Directory message: ", {
      useDefault: useDefaultDirectory,
      directory: directory,
    });
    vscode.postMessage([
      {
        command: "setCurrentDirectoryPath",
        data: { useDefault: useDefaultDirectory, directory: directory },
      },
    ]);
  }, [directory]);

  const handleDirectoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log("Path 111: ", files);

    if (files && files.length > 0) {
      // Extrahiere den Directory-Pfad aus dem ersten File
      const firstFile = files[0];
      const path = firstFile.webkitRelativePath;
      //?  Nimm nur den ersten Teil (Directory-Name)
      const directoryPath = path.split("/")[0];
      console.log("Path 222: ", directoryPath);

      setDirectory(directoryPath);
    }
  };

  const toggelShowDirectorySettings = () =>
    setIsOpenDirectorySettings(!isOpenDirectorySettings);

  return (
    <>
      <Card
        text="black"
        className="w-100"
        style={{
          //width: "280px",
          background: "#f8f9fa",
          borderRadius: "12px",
          // border: "solid",
          width: "100%",
          height: !isOpenDirectorySettings ? "70px" : "",
        }}
      >
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <h6 className="mb-0 fw-semibold text-dark">
                Directory Configuration
              </h6>
              {currentDirectoryRes && (
                <span className="badge bg-secondary ms-2">
                  {currentDirectoryRes.fileCount} files
                </span>
              )}
            </div>
            <Button
              onClick={toggelShowDirectorySettings}
              variant="outline-secondary"
              style={{
                background: "none",
              }}
              aria-label="Refresh"
            >
              <Gear size={14} />
            </Button>
          </div>
          {isOpenDirectorySettings && (
            <div className="mt-3 p-3 bg-white rounded">
              <Form>
                <Row>
                  <Col>
                    <Form.Group className="mb-3" id="formGridCheckbox">
                      <Form.Check
                        type="checkbox"
                        label="Use current workspace as directory"
                        checked={useDefaultDirectory}
                        onChange={(e) =>
                          setUseDefaultDirectory(e.target.checked)
                        }
                      />
                      {currentDirectoryRes && (
                        <Form.Text className="text-muted">
                          current directory:{" "}
                          {currentDirectoryRes.currentWorkspace}
                        </Form.Text>
                      )}
                    </Form.Group>{" "}
                  </Col>
                  <Col>
                    <Form.Group controlId="formFile" className="mb-3">
                      <Form.Label>Selected Directory</Form.Label>
                      <Form.Control
                        ref={fileInputRef}
                        type="file"
                        multiple
                        {...{ webkitdirectory: "", mozdirectory: "" }}
                        onChange={handleDirectoryChange}
                        disabled={useDefaultDirectory}
                        //value={currentDirectoryPath ?? "Kein path"}
                      />
                      {directory && !useDefaultDirectory && (
                        <Form.Text className="text-muted">
                          Selected: {directory}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </div>
          )}
        </Card.Body>
      </Card>
    </>
  );
}

export default DirectorySettingsComponent;
