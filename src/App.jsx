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
function App() {

  // ===============================
  // DARK MODE STATE
  // ===============================
  const [darkMode, setDarkMode] =
    useState(

      localStorage.getItem(
        "darkMode"
      ) === "true"

    );

  // ===============================
  // APPLY DARK CLASS
  // ===============================
  useEffect(() => {

    if (darkMode) {

      document.documentElement.classList.add(
        "dark"
      );

    } else {

      document.documentElement.classList.remove(
        "dark"
      );
    }

    localStorage.setItem(
      "darkMode",
      darkMode
    );

  }, [darkMode]);

  return (

    <div className="dark:bg-gray-900 dark:text-white min-h-screen">

      {/* DARK MODE BUTTON */}
      {/* <button
        onClick={() =>
          setDarkMode(!darkMode)
        }
        className="fixed top-4 right-4 z-50 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded"
      >
        {darkMode
          ? "☀ Light"
          : "🌙 Dark"}
      </button> */}

      <BrowserRouter>

        <Routes>
          <Route
  path="/"
  element={<LandingPage />}
/>
          <Route
  path="/home"
  element={<Home />}
/>

          <Route
            path="/tracker"
            element={<Tracker />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/add-job"
            element={<AddJob />}
          />

          <Route
            path="/applicants/:jobId"
            element={<Applicants />}
          />

          <Route
            path="/register"
            element={<Register />}
          />
          <Route
  path="/admin-dashboard"
  element={<AdminDashboard />}
/>
<Route
  path="/profile"
  element={<Profile />}
/>
        </Routes>

      </BrowserRouter>

    </div>
  );
}

export default App;