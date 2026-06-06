import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";

function AddJob() {

  // ===============================
  // AUTH
  // ===============================
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  // PROTECT ROUTE
  if (!token) return <Navigate to="/login" />;

  // ONLY ADMIN ALLOWED
  if (role !== "admin") {
    return (
      <div className="min-h-screen flex justify-center items-center dark:bg-gray-900">
        <h2 className="text-3xl font-bold text-red-500">Access Denied</h2>
      </div>
    );
  }

  // ===============================
  // STATES
  // ===============================
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    location: "",
    company: "",
    salary: "",
    type: "Remote",
    skills: "",
    description: "", // NEW
  });

  // ===============================
  // HANDLE INPUT
  // ===============================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ===============================
  // SUBMIT
  // ===============================
  const handleSubmit = async () => {
    try {
      if (
        !form.title ||
        !form.location ||
        !form.company ||
        !form.salary ||
        !form.skills ||
        !form.description  // NEW
      ) {
        alert("Please fill all fields");
        return;
      }

      setLoading(true);

      const payload = {
        ...form,
        salary: Number(form.salary),
        skills: form.skills.split(",").map((s) => s.trim()),
      };

      const res = await fetch(
        "https://job-board-backend-755o.onrender.com/api/jobs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // SEND JWT — NEW
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to add job");
        return;
      }

      alert("Job added successfully ✅");
      navigate("/");

    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-black flex justify-center items-center p-6 transition duration-300">

      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-3xl p-8 w-full max-w-lg border border-indigo-100 dark:border-gray-800">

        {/* HEADING */}
        <div className="mb-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">💼</span>
          </div>
          <h2 className="text-2xl font-bold dark:text-white">Add New Job</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Post a new opportunity for candidates</p>
        </div>

        <div className="space-y-3">

          {/* JOB TITLE */}
          <input
            name="title"
            placeholder="Job Title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-slate-400 transition"
          />

          {/* COMPANY */}
          <input
            name="company"
            placeholder="Company Name"
            value={form.company}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-slate-400 transition"
          />

          {/* LOCATION */}
          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-slate-400 transition"
          />

          {/* SALARY */}
          <input
            name="salary"
            type="number"
            placeholder="Salary (₹)"
            value={form.salary}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-slate-400 transition"
          />

          {/* JOB TYPE */}
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition"
          >
            <option>Remote</option>
            <option>Hybrid</option>
            <option>Onsite</option>
          </select>

          {/* SKILLS */}
          <input
            name="skills"
            placeholder="Skills (React, Node, MongoDB)"
            value={form.skills}
            onChange={handleChange}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-slate-400 transition"
          />

          {/* DESCRIPTION — NEW */}
          <textarea
            name="description"
            placeholder="Job description — responsibilities, requirements, perks..."
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-slate-400 transition resize-none"
          />

        </div>

        {/* BUTTONS */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-60"
          >
            {loading ? "Posting..." : "💼 Post Job"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-sm font-medium transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export default AddJob;