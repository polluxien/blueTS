import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import type { VSCodeAPIWrapper } from "../api/vscodeAPI";
import { useEffect, useRef, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { Gear } from "react-bootstrap-icons";

function DirectorySettingsComponent({ vscode }: { vscode: VSCodeAPIWrapper }) {
  const [tsFilesCount, setTsFilesCount] = useState<number>(0);
  const [directory, setDirectory] = useState<string>();
  const [useDefaultDirectory, setUseDefaultDirectory] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isOpenDirectorySettings, setIsOpenDirectorySettings] =
    useState<boolean>(false);

  useEffect(() => {
    vscode.postMessage({
      command: "setCurrentDirectoryPath",
      data: { useDefault: useDefaultDirectory, directory: directory },
    });
  }, [directory]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log(`Recived message with command: ${message.command}`);

      switch (message.command) {
        case "postcurPath": {
          console.log(JSON.stringify(message.data, null, 2));

          setDirectory(message.data.path);
          setTsFilesCount(message.data.tsFilesCount);
          break;
        }
      }
    };
    window.addEventListener("message", handleMessage);

    return () => {
      console.log("Removing message event listener");
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleDirectoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Extrahiere den Directory-Pfad aus dem ersten File
      const firstFile = files[0];
      const path = firstFile.webkitRelativePath;
      const directoryPath = path.split("/")[0]; // Nimm nur den ersten Teil (Directory-Name)
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
              <span className="badge bg-secondary ms-2">
                {tsFilesCount} files
              </span>
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
