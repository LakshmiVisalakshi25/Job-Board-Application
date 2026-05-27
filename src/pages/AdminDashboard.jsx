import { useEffect, useState } from "react";

import {
  Navigate,
  useNavigate
} from "react-router-dom";

function AdminDashboard() {

  // =========================
  // AUTH
  // =========================
  const token =
    localStorage.getItem("token");

  const role =
    localStorage.getItem("role");

  const navigate =
    useNavigate();

  // PROTECT ROUTE
  if (!token) {

    return <Navigate to="/login" />;
  }

  // ADMIN ONLY
  if (role !== "admin") {

    return (

      <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-950">

        <h1 className="text-4xl font-bold text-red-500">

          Access Denied

        </h1>

      </div>

    );
  }

  // =========================
  // STATES
  // =========================
  const [analytics,
    setAnalytics] =
    useState(null);

  // =========================
  // FETCH ANALYTICS
  // =========================
  useEffect(() => {

    fetch(
      "http://localhost:5000/api/admin/analytics"
    )
      .then((res) =>
        res.json()
      )
      .then((data) =>
        setAnalytics(data)
      )
      .catch((err) =>
        console.log(err)
      );

  }, []);

  // LOADING
  if (!analytics) {

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

            Admin Dashboard

          </h1>

          <p className="text-gray-500 dark:text-gray-400">

            Analytics Overview

          </p>

        </div>

        {/* BACK */}
        <button
          onClick={() =>
            navigate("/")
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          Back
        </button>

      </div>

      {/* MAIN */}
      <div className="p-6">

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

          {/* TOTAL JOBS */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow">

            <h2 className="text-lg font-semibold mb-3">

              Total Jobs

            </h2>

            <p className="text-4xl font-bold text-blue-600">

              {analytics.totalJobs}

            </p>

          </div>

          {/* TOTAL USERS */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow">

            <h2 className="text-lg font-semibold mb-3">

              Total Users

            </h2>

            <p className="text-4xl font-bold text-green-600">

              {analytics.totalUsers}

            </p>

          </div>

          {/* APPLICATIONS */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow">

            <h2 className="text-lg font-semibold mb-3">

              Applications

            </h2>

            <p className="text-4xl font-bold text-purple-600">

              {analytics.totalApplications}

            </p>

          </div>

          {/* BOOKMARKS */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow">

            <h2 className="text-lg font-semibold mb-3">

              Bookmarks

            </h2>

            <p className="text-4xl font-bold text-yellow-500">

              {analytics.totalBookmarks}

            </p>

          </div>

          {/* MOST APPLIED */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow">

            <h2 className="text-lg font-semibold mb-3">

              Most Applied

            </h2>

            <p className="text-xl font-bold text-red-500">

              {analytics.mostAppliedJob}

            </p>

          </div>

        </div>

        {/* EXTRA SECTION */}
        <div className="mt-10 bg-white dark:bg-gray-900 rounded-2xl p-6 shadow">

          <h2 className="text-2xl font-bold mb-4">

            Dashboard Summary

          </h2>

          <p className="text-gray-600 dark:text-gray-300 leading-8">

            This admin dashboard provides complete analytics
            of the AI Job Portal system including total jobs,
            users, applications, bookmarks, and the most
            applied job role. This helps administrators monitor
            platform activity effectively.

          </p>

        </div>

      </div>

    </div>

  );
}

export default AdminDashboard;