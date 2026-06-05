import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import {
  useEffect,
  useState
} from "react";

import Home from "./pages/Home";
import Tracker from "./pages/Tracker";
import Login from "./pages/Login";
import AddJob from "./pages/AddJob";
import Applicants from "./pages/Applicants";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import LandingPage from "./pages/LandingPage";
import JobDetail from "./pages/JobDetail";

function App() {

  // ===============================
  // DARK MODE STATE
  // ===============================
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // ===============================
  // APPLY DARK CLASS
  // ===============================
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <div className="dark:bg-gray-900 dark:text-white min-h-screen">

      <BrowserRouter>
        <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/tracker" element={<Tracker />} />
          <Route path="/login" element={<Login />} />
          <Route path="/add-job" element={<AddJob />} />
          <Route path="/applicants/:jobId" element={<Applicants />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />

          {/* JOB DETAIL PAGE */}
          <Route path="/job/:id" element={<JobDetail />} />

        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;