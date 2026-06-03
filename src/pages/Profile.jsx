import { useEffect, useState } from "react";

import {
  Navigate,
  useNavigate
} from "react-router-dom";

function Profile() {

  // ===============================
  // AUTH
  // ===============================
  const token =
    localStorage.getItem("token");

  const userId =
    localStorage.getItem("userId");

  const role =
    localStorage.getItem("role");

  const name =
    localStorage.getItem("name");

  const navigate =
    useNavigate();

  // PROTECT ROUTE
  if (!token) {

    return <Navigate to="/login" />;
  }

  // ===============================
  // STATES
  // ===============================
  const [loading,
    setLoading] =
    useState(true);

  const [saving,
    setSaving] =
    useState(false);

  const [form,
    setForm] =
    useState({

      name: "",

      bio: "",

      college: "",

      skills: "",

      github: "",

      linkedin: "",

      profileImage: ""

    });

  // ===============================
  // FETCH PROFILE
  // ===============================
  useEffect(() => {

    fetch(

      `https://job-board-backend-755o.onrender.com/api/profile/${userId}`

    )
      .then((res) =>
        res.json()
      )
      .then((data) => {

        setForm({

          name:
            data.name || "",

          bio:
            data.bio || "",

          college:
            data.college || "",

          skills:
            data.skills
              ?.join(", ") || "",

          github:
            data.github || "",

          linkedin:
            data.linkedin || "",

          profileImage:
            data.profileImage || ""

        });

      })
      .catch((err) =>
        console.log(err)
      )
      .finally(() =>
        setLoading(false)
      );

  }, [userId]);

  // ===============================
  // HANDLE CHANGE
  // ===============================
  const handleChange =
    (e) => {

      setForm({

        ...form,

        [e.target.name]:
          e.target.value

      });
    };

  // ===============================
  // SAVE PROFILE
  // ===============================
  const handleSave =
    async () => {

      try {

        setSaving(true);

        const payload = {

          ...form,

          skills:
            form.skills
              .split(",")
              .map((s) =>
                s.trim()
              )

        };

        const res =
          await fetch(

            `https://job-board-backend-755o.onrender.com/api/profile/${userId}`,

            {

              method: "PUT",

              headers: {

                "Content-Type":
                  "application/json"

              },

              body:
                JSON.stringify(
                  payload
                )

            }

          );

        const data =
          await res.json();

        alert(
          data.message
        );

      } catch (err) {

        console.log(err);

        alert(
          "Profile update failed"
        );

      } finally {

        setSaving(false);
      }
    };

  // ===============================
  // LOADING
  // ===============================
  if (loading) {

    return (

      <div className="min-h-screen flex justify-center items-center dark:bg-gray-950 dark:text-white">

        Loading...

      </div>

    );
  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:bg-gray-950 dark:text-white">

      {/* ===== NAVBAR ===== */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-indigo-100 dark:bg-gray-900/80 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* BRAND */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">J</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-tight">JobBoard</p>
              <p className="text-xs text-slate-400 dark:text-gray-500 leading-tight">{name}</p>
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate("/home")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              ← Back to Dashboard
            </button>

            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Logout
            </button>

          </div>

        </div>
      </nav>

      {/* MAIN */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* PAGE HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your profile
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-lg dark:bg-gray-900 rounded-3xl shadow-2xl border border-indigo-100 dark:border-gray-800 overflow-hidden">

          {/* TOP BANNER */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-40">
          </div>

          {/* PROFILE CONTENT */}
          <div className="p-6">

            {/* IMAGE */}
            <div className="flex flex-col items-center -mt-24">

              <img
                src={
                  form.profileImage ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                }
                alt="profile"
                className="w-36 h-36 rounded-full border-4 border-white object-cover shadow-lg"
              />

            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

              {/* NAME */}
              <div>

                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full mt-2 border border-indigo-100 dark:border-gray-700 dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />

              </div>

              {/* COLLEGE */}
              <div>

                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  College
                </label>

                <input
                  type="text"
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                  className="w-full mt-2 border border-indigo-100 dark:border-gray-700 dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />

              </div>

              {/* GITHUB */}
              <div>

                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  GitHub
                </label>

                <input
                  type="text"
                  name="github"
                  value={form.github}
                  onChange={handleChange}
                  className="w-full mt-2 border border-indigo-100 dark:border-gray-700 dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />

              </div>

              {/* LINKEDIN */}
              <div>

                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  LinkedIn
                </label>

                <input
                  type="text"
                  name="linkedin"
                  value={form.linkedin}
                  onChange={handleChange}
                  className="w-full mt-2 border border-indigo-100 dark:border-gray-700 dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                />

              </div>

            </div>

            {/* BIO */}
            <div className="mt-6">

              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Bio
              </label>

              <textarea
                rows="4"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="w-full mt-2 border border-indigo-100 dark:border-gray-700 dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />

            </div>

            {/* SKILLS */}
            <div className="mt-6">

              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Skills
              </label>

              <input
                type="text"
                name="skills"
                placeholder="React, Node.js, MongoDB"
                value={form.skills}
                onChange={handleChange}
                className="w-full mt-2 border border-indigo-100 dark:border-gray-700 dark:bg-gray-800 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />

            </div>

            {/* SAVE BUTTON */}
            <div className="mt-8">

              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white px-8 py-3 rounded-xl text-lg font-medium transition"
              >
                {saving
                  ? "Saving..."
                  : "Save Profile"}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;