import { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import { List, Trash } from "react-bootstrap-icons";

function ConsoleLogComponent({
  logsAsStringArr,
}: {
  logsAsStringArr: string[];
}) {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message]);
  };

  const clearLog = () => {
    setLogs([]);
  };

  useEffect(() => {
    if (logsAsStringArr && logsAsStringArr.length > 0) {
      setLogs(logsAsStringArr); 
    }
  }, [logsAsStringArr]);

  return (
    <>
      <Card
        text="black"
        className="w-100"
        style={{
          background: "#f8f9fa",
          borderRadius: "0px",
          width: "100%",
          border: 0,
        }}
      >
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between mb-3">
            {/* Titel */}
            <h6 className="mb-0 fw-semibold text-dark">Console</h6>

            {/* Icon-Buttons rechts */}
            <div className="d-flex gap-2">
              <Button
                variant="link"
                size="sm"
                className="p-0 text-dark"
                onClick={clearLog}
                aria-label="Clear Log"
              >
                <Trash size={16} />
              </Button>
              <Button
                variant="link"
                size="sm"
                className="p-0 text-dark"
                onClick={() =>
                  addLog(new Date().toLocaleTimeString() + " Hello")
                }
                aria-label="Refresh"
              >
                <List size={16} />
              </Button>
            </div>
          </div>
          <div
            className="bg-dark text-white p-2 font-monospace rounded-4 overflow-auto"
            style={{ height: "12rem" }}
          >
            {logs.map((log, i) => (
              <div key={i}>
                <h6>{log}</h6>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </>
  );
}

export default ConsoleLogComponent;
