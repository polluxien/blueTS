import { useEffect, useState } from "react";
import type { Path } from "react-router-dom";
import { vscode } from "../api/vscodeAPI";

export type TsFileResource = {
  name: string;
  path: Path;
};

export type ParameterRessource = {
  name: string;
  type: string;
  optional: boolean;
};

export type ConstructorRessource = {
  parameters: ParameterRessource[] | undefined;
  returnType: string;
};

export type ClassRessource = {
  className: string;
  tsFile: TsFileResource;
  constructor: ConstructorRessource | undefined;
};

function ClassPage() {
  const [classes, setClasses] = useState<ClassRessource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    vscode.postMessage({
      command: "webViewReady",
    });
  }, []);
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      console.log(`Recived message with command: ${message.command}`);

      switch (message.command) {
        case "postClasses":
          console.log(`Massage from command has data: ${message.data}`);
          setClasses(message.data);
          console.log("classes var: ", classes);
          setLoading(false);
          break;
        case "error":
          setError(message.error);
          setLoading(false);
          break;
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div>
        <h1>TypeScript Klassen</h1>
        <div className="card">
          <div>
            {classes.map((cls, index) => (
              <p key={index}>{cls.className}</p>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ClassPage;
