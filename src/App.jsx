import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tracker from "./pages/Tracker";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tracker" element={<Tracker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;