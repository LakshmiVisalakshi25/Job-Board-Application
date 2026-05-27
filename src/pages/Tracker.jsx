import { useEffect, useState } from "react";

import {
  Navigate,
  useNavigate
} from "react-router-dom";

function Tracker() {

  // ===============================
  // AUTH
  // ===============================
  const token =
    localStorage.getItem("token");

  const role =
    localStorage.getItem("role");

  const userId =
    localStorage.getItem("userId");

  const name =
    localStorage.getItem("name");

  const navigate =
    useNavigate();

  // PROTECT ROUTE
  if (!token) {

    return <Navigate to="/login" />;
  }

  // USER ONLY
  if (role !== "user") {

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
  const [loading,
    setLoading] =
    useState(true);

  const [bookmarkedJobs,
    setBookmarkedJobs] =
    useState([]);

  const [applications,
    setApplications] =
    useState([]);

  // ===============================
  // FETCH DATA
  // ===============================
  useEffect(() => {

    const fetchData =
      async () => {

        try {

          // =========================
          // BOOKMARKS
          // =========================
          const bookmarkRes =
            await fetch(

              `https://job-board-backend-755o.onrender.com/api/bookmarks/${userId}`

            );

          const bookmarks =
            await bookmarkRes.json();

          const bookmarkedIds =
            bookmarks.map(
              (b) => b.jobId
            );

          // =========================
          // APPLICATIONS
          // =========================
          const appRes =
            await fetch(

              `https://job-board-backend-755o.onrender.com/api/user-applications/${userId}`

            );

          const apps =
            await appRes.json();

          // =========================
          // ALL JOBS
          // =========================
          const jobsRes =
            await fetch(

              "https://job-board-backend-755o.onrender.com/api/jobs"

            );

          const allJobs =
            await jobsRes.json();

          // =========================
          // FILTER BOOKMARKS
          // =========================
          const filteredBookmarks =
            allJobs.filter((job) =>

              bookmarkedIds.includes(
                job._id
              )

            );

          setBookmarkedJobs(
            filteredBookmarks
          );

          // =========================
          // MERGE APPLICATIONS + JOBS
          // =========================
          const mergedApps =
            apps.map((app) => {

              const matchedJob =
                allJobs.find(

                  (job) =>
                    job._id ===
                    app.jobId

                );

              return {

                ...app,

                job:
                  matchedJob

              };
            });

          setApplications(
            mergedApps
          );

        } catch (err) {

          console.log(err);

        } finally {

          setLoading(false);
        }
      };

    fetchData();

  }, [userId]);

  // ===============================
  // REMOVE BOOKMARK
  // ===============================
  const removeBookmark =
    async (jobId) => {

      try {

        await fetch(
          "https://job-board-backend-755o.onrender.com/api/bookmarks",
          {

            method: "DELETE",

            headers: {

              "Content-Type":
                "application/json"

            },

            body: JSON.stringify({

              userId,

              jobId

            })

          }
        );

        setBookmarkedJobs(

          bookmarkedJobs.filter(

            (job) =>
              job._id !== jobId

          )

        );

      } catch (err) {

        console.log(err);
      }
    };

  // ===============================
  // STATUS COLORS
  // ===============================
  const getStatusColor =
    (status) => {

      switch (status) {

        case "Shortlisted":

          return "bg-blue-500";

        case "Rejected":

          return "bg-red-500";

        case "Selected":

          return "bg-green-600";

        default:

          return "bg-yellow-500";
      }
    };

  return (

    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white p-6 transition duration-300">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">

        <div>

          <h2 className="text-3xl font-bold">

            My Tracker

          </h2>

          <p className="text-gray-600 dark:text-gray-300">

            Welcome,
            {" "}
            {name}

          </p>

        </div>

        <div className="flex gap-3">

          {/* HOME */}
          <button
            onClick={() =>
              navigate("/")
            }
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Home
          </button>

          {/* LOGOUT */}
          <button
            onClick={() => {

              localStorage.clear();

              navigate("/login");

            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>

        </div>

      </div>

      {/* LOADING */}
      {loading ? (

        <div className="text-center mt-20">

          <h2 className="text-2xl font-semibold">

            Loading...

          </h2>

        </div>

      ) : (

        <>

          {/* ========================= */}
          {/* APPLIED JOBS */}
          {/* ========================= */}
          <div className="mb-10">

            <h2 className="text-2xl font-bold mb-5">

              Applied Jobs

            </h2>

            {applications.length === 0 ? (

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">

                <h3 className="text-xl font-semibold">

                  No Applications Yet 🚀

                </h3>

              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                {applications.map((app) => (

                  <div
                    key={app._id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5"
                  >

                    {/* TITLE */}
                    <h3 className="text-xl font-bold mb-2">

                      {
                        app.job?.title ||
                        "Job Deleted"
                      }

                    </h3>

                    {/* COMPANY */}
                    <p className="text-gray-600 dark:text-gray-300 mb-2">

                      {
                        app.job?.company
                      }

                    </p>

                    {/* STATUS */}
                    <div className="mb-3">

                      <span
                        className={`${getStatusColor(app.status)} text-white px-3 py-1 rounded-full text-sm`}
                      >
                        {app.status}
                      </span>

                    </div>

                    {/* DATE */}
                    <p className="text-sm text-gray-500 dark:text-gray-400">

                      Applied:
                      {" "}

                      {
                        new Date(
                          app.appliedAt
                        ).toLocaleDateString()
                      }

                    </p>

                  </div>

                ))}

              </div>

            )}

          </div>

          {/* ========================= */}
          {/* BOOKMARKS */}
          {/* ========================= */}
          <div>

            <h2 className="text-2xl font-bold mb-5">

              Bookmarked Jobs

            </h2>

            {bookmarkedJobs.length === 0 ? (

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow">

                <h3 className="text-xl font-semibold">

                  No Bookmarks Yet 📌

                </h3>

              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {bookmarkedJobs.map((job) => (

                  <div
                    key={job._id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5"
                  >

                    {/* TITLE */}
                    <h3 className="text-lg font-semibold">

                      {job.title}

                    </h3>

                    {/* LOCATION */}
                    <p className="text-gray-600 dark:text-gray-300">

                      {job.location}

                    </p>

                    {/* SALARY */}
                    <p className="text-green-600 font-bold mt-1">

                      ₹{job.salary}

                    </p>

                    {/* TYPE */}
                    <p className="text-sm mt-1">

                      {job.type}

                    </p>

                    {/* SKILLS */}
                    <div className="flex flex-wrap gap-2 mt-3">

                      {job.skills?.map(
                        (skill, i) => (

                          <span
                            key={i}
                            className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm"
                          >
                            {skill}
                          </span>

                        )
                      )}

                    </div>

                    {/* REMOVE */}
                    <button
                      onClick={() =>
                        removeBookmark(
                          job._id
                        )
                      }
                      className="mt-5 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                      Remove Bookmark
                    </button>

                  </div>

                ))}

              </div>

            )}

          </div>

        </>

      )}

    </div>
  );
}

export default Tracker;