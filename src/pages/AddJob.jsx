import { useState } from "react";

import {
  useNavigate,
  Navigate
} from "react-router-dom";

function AddJob() {

  // ===============================
  // AUTH
  // ===============================
  const token = localStorage.getItem("token");

  const role = localStorage.getItem("role");

  const navigate = useNavigate();

  // PROTECT ROUTE
  if (!token) {

    return <Navigate to="/login" />;
  }

  // ONLY ADMIN ALLOWED
  if (role !== "admin") {

    return (

      <div className="min-h-screen flex justify-center items-center dark:bg-gray-900">

        <h2 className="text-3xl font-bold text-red-500">

          Access Denied

        </h2>

      </div>
    );
  }

  // ===============================
  // STATES
  // ===============================
  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({

      title: "",

      location: "",

      company: "",

      salary: "",

      type: "Remote",

      skills: ""

    });

  // ===============================
  // HANDLE INPUT
  // ===============================
  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]:
        e.target.value

    });
  };

  // ===============================
  // SUBMIT
  // ===============================
  const handleSubmit =
    async () => {

      try {

        // VALIDATION
        if (

          !form.title ||

          !form.location ||

          !form.company ||

          !form.salary ||

          !form.skills

        ) {

          alert(
            "Please fill all fields"
          );

          return;
        }

        setLoading(true);

        // PAYLOAD
        const payload = {

          ...form,

          role: "admin",

          salary:
            Number(form.salary),

          skills:
            form.skills
              .split(",")
              .map((s) =>
                s.trim()
              )
        };

        const res =
          await fetch(
            "http://localhost:5000/api/jobs",
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify(
                payload
              )
            }
          );

        const data =
          await res.json();

        if (!res.ok) {

          alert(
            data.message ||
            "Failed to add job"
          );

          return;
        }

        alert(
          "Job added successfully ✅"
        );

        navigate("/");

      } catch (err) {

        console.log(err);

        alert(
          "Something went wrong"
        );

      } finally {

        setLoading(false);
      }
    };

  return (

    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-center p-6 transition duration-300">

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 w-full max-w-md">

        {/* HEADING */}
        <h2 className="text-3xl font-bold mb-2 text-center dark:text-white">

          Add New Job

        </h2>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">

          Post a new opportunity for candidates

        </p>

        {/* JOB TITLE */}
        <input
          name="title"
          placeholder="Job Title"
          value={form.title}
          onChange={handleChange}
          className="border p-3 mb-4 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        {/* LOCATION */}
        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          className="border p-3 mb-4 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        {/* COMPANY */}
        <input
          name="company"
          placeholder="Company Name"
          value={form.company}
          onChange={handleChange}
          className="border p-3 mb-4 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        {/* SALARY */}
        <input
          name="salary"
          type="number"
          placeholder="Salary"
          value={form.salary}
          onChange={handleChange}
          className="border p-3 mb-4 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        {/* JOB TYPE */}
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border p-3 mb-4 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >

          <option>
            Remote
          </option>

          <option>
            Hybrid
          </option>

          <option>
            Onsite
          </option>

        </select>

        {/* SKILLS */}
        <input
          name="skills"
          placeholder="Skills (React, Node, MongoDB)"
          value={form.skills}
          onChange={handleChange}
          className="border p-3 mb-5 rounded-lg w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        {/* BUTTONS */}
        <div className="flex gap-3">

          {/* POST JOB */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg w-full transition"
          >

            {loading
              ? "Posting..."
              : "Post Job"}

          </button>

          {/* CANCEL */}
          <button
            onClick={() =>
              navigate("/")
            }
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-3 rounded-lg w-full transition"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}

export default AddJob;