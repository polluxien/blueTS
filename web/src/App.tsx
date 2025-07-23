import { Route, Routes, Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import LandingPage from "./components/LandingPage.tsx";
import ErrorFallback from "./components/errorComponents/ErrorFallback.tsx";
import FileComponent from "./components/FileComponent.tsx";

function App() {
  return (
    <>
      <div>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          /////<FileComponent></FileComponent>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            //Fallback
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </>
  );
}

export default App;
