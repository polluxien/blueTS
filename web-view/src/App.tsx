
import { ErrorBoundary } from "react-error-boundary";
import PageController from "./components/PageController.tsx";
import ErrorFallback from "./components/errorComponents/ErrorFallback.tsx";
import { vscode, VscodeContext } from "./api/vscodeAPIContext.ts";


function App() {
  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <VscodeContext.Provider value={vscode}>
        <PageController />
        </VscodeContext.Provider>
      </ErrorBoundary>
    </>
  );
}

export default App;
