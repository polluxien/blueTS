import { Route, Routes, Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import ClassPage from "./components/ClassPage.tsx";
import ErrorFallback from "./components/errorComponents/ErrorFallback.tsx";

function App() {
  return (
    <>
      <div>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Routes>
            <Route path="/" element={<ClassPage />} />
            //Fallback
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </>
  );
}

export default App;
