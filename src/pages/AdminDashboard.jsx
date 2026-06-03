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

  const name =
    localStorage.getItem("name");

  const navigate =
    useNavigate();

  // PROTECT ROUTE
  if (!token) {

    return <Navigate to="/login" />;
  }

  // ADMIN ONLY
  if (role !== "admin") {

    return (

      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:bg-gray-950">

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
      "https://job-board-backend-755o.onrender.com/api/admin/analytics"
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

  // =========================
  // STAT CARDS CONFIG
  // =========================
  const statCards = [
    {
      label: "Total Jobs",
      value: analytics.totalJobs,
      color: "text-indigo-600",
      bg: "from-indigo-50 to-indigo-100",
      icon: "💼",
    },
    {
      label: "Total Users",
      value: analytics.totalUsers,
      color: "text-emerald-600",
      bg: "from-emerald-50 to-emerald-100",
      icon: "👥",
    },
    {
      label: "Applications",
      value: analytics.totalApplications,
      color: "text-purple-600",
      bg: "from-purple-50 to-purple-100",
      icon: "📋",
    },
    {
      label: "Bookmarks",
      value: analytics.totalBookmarks,
      color: "text-amber-500",
      bg: "from-amber-50 to-amber-100",
      icon: "🔖",
    },
    {
      label: "Most Applied",
      value: analytics.mostAppliedJob,
      color: "text-rose-500",
      bg: "from-rose-50 to-rose-100",
      icon: "🔥",
      small: true,
    },
  ];

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
              ← Job Listings
            </button>

            <button
              onClick={() => navigate("/add-job")}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              + Add Job
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Analytics Overview
          </p>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

          {statCards.map((card, i) => (

            <div
              key={i}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-indigo-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-6"
            >

              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{card.icon}</span>
                <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {card.label}
                </h2>
              </div>

              <p className={`font-bold ${card.color} ${card.small ? "text-xl" : "text-4xl"}`}>
                {card.value}
              </p>

            </div>

          ))}

        </div>

        {/* SUMMARY SECTION */}
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-3xl shadow-lg border border-indigo-100 dark:border-gray-800 p-6">

          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
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