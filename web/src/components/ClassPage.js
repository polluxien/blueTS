import { useEffect, useState } from "react";
import { vscode } from "../api/vscodeAPI";
import ClassCardComponent from "./classComponents/classCardComponent.tsx";
function ClassPage() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        vscode.postMessage({
            command: "webViewReady",
        });
    }, []);
    useEffect(() => {
        const handleMessage = (event) => {
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
        return (<div className="loading-container">
        <div>Loading...</div>
      </div>);
    }
    if (error) {
        return <div>{error}</div>;
    }
    return (<>
      <div>
        <h1>TypeScript Klassen</h1>
        <div>
          {classes.map((cls, index) => (<div key={index}>
              <ClassCardComponent cls={cls}></ClassCardComponent>
            </div>))}
        </div>
      </div>
    </>);
}
export default ClassPage;
//# sourceMappingURL=ClassPage.js.map