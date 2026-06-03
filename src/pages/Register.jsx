import { useState } from "react";

import {
  useNavigate
} from "react-router-dom";

function Register() {

  // ===============================
  // STATES
  // ===============================
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  // ===============================
  // HANDLE INPUT
  // ===============================
  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // ===============================
  // REGISTER
  // ===============================
  const handleRegister = async () => {

    try {

      // Validation
      if (
        !form.name ||
        !form.email ||
        !form.password
      ) {
        alert("Please fill all fields");
        return;
      }

      setLoading(true);

      const res = await fetch(
        "https://job-board-backend-755o.onrender.com/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const data = await res.json();

      // Registration failed
      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration successful ✅");

      navigate("/login");

    } catch (err) {

      console.log(err);

      alert("Something went wrong");

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex justify-center items-center p-6 transition duration-300">

      <div className="bg-white/90 backdrop-blur-lg shadow-2xl border border-indigo-100 rounded-3xl p-8 w-full max-w-md">

        {/* Heading */}
        <h2 className="text-3xl font-bold mb-2 text-center dark:text-white">
          Job Portal
        </h2>

        {/* Back + Subtitle */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-indigo-600 hover:text-indigo-800 font-semibold transition"
          >
            ← Back to Home
          </button>

          <span className="text-sm text-gray-500">
            Create Account ✨
          </span>
        </div>

        <p className="text-center text-gray-600 mb-6">
          Register to continue
        </p>

        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Enter name"
          value={form.name}
          onChange={handleChange}
          className="border p-3 mb-4 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={form.email}
          onChange={handleChange}
          className="border p-3 mb-4 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={form.password}
          onChange={handleChange}
          className="border p-3 mb-4 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        {/* Register Button */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white w-full py-3 rounded-xl transition"
        >
          {loading
            ? "Registering..."
            : "Register"}
        </button>

        {/* Login Link */}
        <p className="text-center mt-5 text-sm dark:text-gray-300">

          Already have an account?{" "}

          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Login
          </span>

        </p>

      </div>

    </div>
  );
}

export default Register;