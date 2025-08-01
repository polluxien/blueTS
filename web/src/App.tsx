import { Route, Routes, Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import LandingPage from "./components/LandingPage.tsx";
import ErrorFallback from "./components/errorComponents/ErrorFallback.tsx";
import DirectorySettingsComponent from "./components/DirectorySettingsComponent.tsx";

//wichtig zur wditergabe der API -> kann nur einmalig instanziert werden
import { vscode } from "./api/vscodeAPI.ts";

function App() {
  return (
    <>
      <div>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <DirectorySettingsComponent vscode={vscode}></DirectorySettingsComponent>
          <Routes>
            <Route path="/" element={<LandingPage vscode={vscode}/>} />
            //Fallback
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </>
  );
}

export default App;
