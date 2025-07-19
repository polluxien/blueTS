import { Route, Routes, Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import LandingPage from "./components/LandingPage.tsx";
import ErrorFallback from "./components/errorComponents/ErrorFallback.tsx";

function App() {
  return (
    <>
      <div>
        <h1>Hier ist ein Titel</h1>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
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
