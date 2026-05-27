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

      `http://localhost:5000/api/profile/${userId}`

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

            `http://localhost:5000/api/profile/${userId}`,

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

    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 dark:text-white">

      {/* HEADER */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-6 py-4 flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold">

            My Profile

          </h1>

          <p className="text-gray-500 dark:text-gray-400">

            Manage your profile

          </p>

        </div>

        {/* BACK */}
        <button
          onClick={() =>
            navigate("/")
          }
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Back
        </button>

      </div>

      {/* MAIN */}
      <div className="max-w-5xl mx-auto p-6">

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">

          {/* TOP SECTION */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-40">

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

              <input
                type="text"
                name="profileImage"
                placeholder="Profile Image URL"
                value={
                  form.profileImage
                }
                onChange={
                  handleChange
                }
                className="mt-4 border dark:border-gray-700 dark:bg-gray-800 px-4 py-2 rounded-lg w-full max-w-md"
              />

            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">

              {/* NAME */}
              <div>

                <label className="font-semibold">

                  Name

                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full mt-2 border dark:border-gray-700 dark:bg-gray-800 p-3 rounded-lg"
                />

              </div>

              {/* COLLEGE */}
              <div>

                <label className="font-semibold">

                  College

                </label>

                <input
                  type="text"
                  name="college"
                  value={
                    form.college
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full mt-2 border dark:border-gray-700 dark:bg-gray-800 p-3 rounded-lg"
                />

              </div>

              {/* GITHUB */}
              <div>

                <label className="font-semibold">

                  GitHub

                </label>

                <input
                  type="text"
                  name="github"
                  value={
                    form.github
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full mt-2 border dark:border-gray-700 dark:bg-gray-800 p-3 rounded-lg"
                />

              </div>

              {/* LINKEDIN */}
              <div>

                <label className="font-semibold">

                  LinkedIn

                </label>

                <input
                  type="text"
                  name="linkedin"
                  value={
                    form.linkedin
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full mt-2 border dark:border-gray-700 dark:bg-gray-800 p-3 rounded-lg"
                />

              </div>

            </div>

            {/* BIO */}
            <div className="mt-6">

              <label className="font-semibold">

                Bio

              </label>

              <textarea
                rows="4"
                name="bio"
                value={form.bio}
                onChange={
                  handleChange
                }
                className="w-full mt-2 border dark:border-gray-700 dark:bg-gray-800 p-3 rounded-lg"
              />

            </div>

            {/* SKILLS */}
            <div className="mt-6">

              <label className="font-semibold">

                Skills

              </label>

              <input
                type="text"
                name="skills"
                placeholder="React, Node.js, MongoDB"
                value={
                  form.skills
                }
                onChange={
                  handleChange
                }
                className="w-full mt-2 border dark:border-gray-700 dark:bg-gray-800 p-3 rounded-lg"
              />

            </div>

            {/* SAVE BUTTON */}
            <div className="mt-8">

              <button
                onClick={
                  handleSave
                }
                disabled={saving}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl text-lg"
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