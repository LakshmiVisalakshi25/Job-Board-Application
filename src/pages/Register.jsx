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
        "https://job-board-backend-755o.onrender.com//api/register",
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
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">

        {/* Heading */}
        <h2 className="text-3xl font-bold mb-6 text-center">
          Register
        </h2>

        {/* Name */}
        <input
          type="text"
          name="name"
          placeholder="Enter name"
          value={form.name}
          onChange={handleChange}
          className="border p-3 mb-4 rounded w-full"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={form.email}
          onChange={handleChange}
          className="border p-3 mb-4 rounded w-full"
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Enter password"
          value={form.password}
          onChange={handleChange}
          className="border p-3 mb-4 rounded w-full"
        />

        {/* Register Button */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white w-full py-3 rounded"
        >
          {loading
            ? "Registering..."
            : "Register"}
        </button>

        {/* Login */}
        <p className="text-center mt-4 text-sm">

          Already have an account?{" "}

          <span
            onClick={() => navigate("/login")}
            className="text-blue-500 cursor-pointer"
          >
            Login
          </span>

        </p>

      </div>

    </div>
  );
}

export default Register;