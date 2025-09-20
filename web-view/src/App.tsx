import { ErrorBoundary } from "react-error-boundary";
import PageController from "./components/PageController.tsx";
import ErrorFallback from "./components/errorComponents/ErrorFallback.tsx";

//wichtig zur weitergabe der API -> kann nur einmalig instanziert werden
import { vscode } from "./api/vscodeAPI.ts";

function App() {
  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <PageController vscode={vscode} />
      </ErrorBoundary>
    </>
  );
}

export default App;
