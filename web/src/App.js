import { Route, Routes, Navigate } from "react-router-dom";
import PageClasses from "./components/PageClasses";
function App() {
    return (<>
      <div>
        <Routes>
          <Route path="/" element={<PageClasses />}/>
          //Fallback
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
      </div>
    </>);
}
export default App;
//# sourceMappingURL=App.js.map