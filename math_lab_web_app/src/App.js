import logo from "./logo.svg";
import "./App.css";
import Enter from "./pages/enter";
import { Navigate, Route, Routes } from "react-router-dom";
import Form from "./pages/form";
import Admin from "./pages/admin";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Enter/>}/>
      <Route path="/rooms/:roomId" element={<Form />} />
      <Route path="/admin/:adminId" element={<Admin />} />
      <Route path="*" element={<Navigate to="/"/>} />
    </Routes>
  );
}

export default App;
