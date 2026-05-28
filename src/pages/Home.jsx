import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";

function Home() {

  // =====================================
  // STATES (ALL hooks before any early return)
  // =====================================
  const [allJobs, setAllJobs] = useState([]);
  const [view, setView] = useState("grid");
  const [jobType, setJobType] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const jobsPerPage = 8;
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [readNotifications, setReadNotifications] = useState(
    () => JSON.parse(localStorage.getItem("readNotifs") || "[]")
  );
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    percentage: "",
    resume: "",
  });

  // =====================================
  // AUTH (after all hooks)
  // =====================================
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");
  const navigate = useNavigate();

  // =====================================
  // FETCH JOBS
  // =====================================
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("https://job-board-backend-755o.onrender.com/api/jobs");
        const data = await res.json();
        setAllJobs(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchJobs();
  }, []);

  // =====================================
  // FETCH APPLICATIONS + NOTIFICATIONS
  // =====================================
  useEffect(() => {
    if (!userId) return;

    const fetchApplications = async () => {
      try {
        const res = await fetch(
          `https://job-board-backend-755o.onrender.com/api/user-applications/${userId}`
        );
        const data = await res.json();

        // Only active (non-rejected) applications count as "applied"
        const activeIds = data
          .filter((app) => app.status !== "Rejected")
          .map((a) => a.jobId);
        setAppliedJobs(activeIds);

        // Notifications for status changes
        const notifs = data.filter(
          (app) =>
            app.status === "Shortlisted" ||
            app.status === "Rejected" ||
            app.status === "Selected"
        );
        setNotifications(notifs);
      } catch (err) {
        console.log(err);
      }
    };

    fetchApplications();

    // Realtime refresh
    const interval = setInterval(fetchApplications, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  // =====================================
  // FETCH BOOKMARKS
  // =====================================
  useEffect(() => {
    if (!userId) return;
    fetch(`https://job-board-backend-755o.onrender.com/api/bookmarks/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const ids = data.map((b) => b.jobId);
        setBookmarkedJobs(ids);
      });
  }, [userId]);

  // =====================================
  // AUTH GUARD (after all hooks)
  // =====================================
  if (!token) {
    return <Navigate to="/login" />;
  }

  // =====================================
  // FILTER + SORT JOBS
  // =====================================
  const filteredJobs = allJobs
    .filter((job) => {
      const matchesType = jobType === "all" || job.type === jobType;
      const matchesSearch =
        search === "" ||
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.toLowerCase().includes(search.toLowerCase()) ||
        job.skills?.some((s) =>
          s.toLowerCase().includes(search.toLowerCase())
        );
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      if (sort === "salary-desc") return b.salary - a.salary;
      if (sort === "salary-asc") return a.salary - b.salary;
      return 0;
    });

  // =====================================
  // PAGINATION
  // =====================================
  const startIndex = (page - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + jobsPerPage);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Reset to page 1 when filters change — handled inline via useEffect below
  useEffect(() => {
    setPage(1);
  }, [search, jobType, sort]);

  // =====================================
  // DARK MODE
  // =====================================
  const toggleDarkMode = () => {
    const current = localStorage.getItem("darkMode") === "true";
    localStorage.setItem("darkMode", !current);
    if (!current) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    window.location.reload();
  };

  // =====================================
  // LOGOUT
  // =====================================
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // =====================================
  // BOOKMARK
  // =====================================
  const toggleBookmark = async (jobId) => {
    try {
      if (bookmarkedJobs.includes(jobId)) {
        await fetch("https://job-board-backend-755o.onrender.com/api/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, jobId }),
        });
        setBookmarkedJobs(bookmarkedJobs.filter((id) => id !== jobId));
      } else {
        await fetch("https://job-board-backend-755o.onrender.com/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, jobId }),
        });
        setBookmarkedJobs([...bookmarkedJobs, jobId]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // =====================================
  // APPLY FORM
  // =====================================
  const openApplyForm = (job) => {
    setSelectedJob(job);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // =====================================
  // SUBMIT APPLICATION
  // =====================================
  const submitApplication = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.percentage ||
      !formData.resume
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("https://job-board-backend-755o.onrender.com/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, jobId: selectedJob._id, ...formData }),
      });
      const data = await res.json();
      alert(data.message);
      setAppliedJobs([...appliedJobs, selectedJob._id]);
      setShowForm(false);
    } catch (err) {
      console.log(err);
    }
  };

  // =====================================
  // WITHDRAW
  // =====================================
  const withdrawApplication = async (jobId) => {
    try {
      const res = await fetch("https://job-board-backend-755o.onrender.com/api/apply", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, jobId }),
      });
      const data = await res.json();
      alert(data.message);
      setAppliedJobs(appliedJobs.filter((id) => id !== jobId));
    } catch (err) {
      console.log(err);
    }
  };

  // =====================================
  // NOTIFICATIONS
  // =====================================
  const unreadNotifications = notifications.filter(
    (n) => !readNotifications.includes(n._id)
  );

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    // Mark all as read
    const ids = notifications.map((n) => n._id);
    setReadNotifications(ids);
    localStorage.setItem("readNotifs", JSON.stringify(ids));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 dark:text-white">

      {/* NAVBAR */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-50 shadow-sm">
        <div className="w-full px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          {/* LEFT */}
          <div>
            <h1 className="text-3xl sm:text-2xl font-bold tracking-wide">Welcome 👋</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{name}</p>
          </div>

          {/* RIGHT */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">

            {/* DARK MODE */}
            <button
              onClick={toggleDarkMode}
              className="w-11 h-11 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-black text-lg shadow"
            >
              🌙
            </button>

            {/* USER TRACKER */}
            {role === "user" && (
              <button
                onClick={() => navigate("/tracker")}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-xl text-sm font-medium"
              >
                Tracker
              </button>
            )}

            {/* ADMIN BUTTONS */}
            {role === "admin" && (
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/admin-dashboard")}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/add-job")}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm"
                >
                  Add Job
                </button>
              </div>
            )}

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className="relative w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-800 flex justify-center items-center text-lg border dark:border-gray-700"
              >
                🔔
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex justify-center items-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl shadow-2xl p-4 z-50">
                  <h3 className="font-bold text-lg mb-4">Notifications</h3>
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500">No notifications</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {notifications.map((n, i) => (
                        <div
                          key={i}
                          className="border dark:border-gray-700 rounded-xl p-3"
                        >
                          <p className="font-semibold">{n.status}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Your application status was updated
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* END NOTIFICATIONS */}

            {/* PROFILE MENU */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="w-11 h-11 rounded-full overflow-hidden border-2 border-indigo-500 shadow"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-14 w-56 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b dark:border-gray-700">
                    <h3 className="font-bold">{name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{role}</p>
                  </div>
                  <button
                    onClick={() => { setShowProfile(false); navigate("/profile"); }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    👤 See Profile
                  </button>
                  <button
                    onClick={() => { setShowProfile(false); navigate("/profile"); }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    ✏ Update Profile
                  </button>
                  {role === "user" && (
                    <button
                      onClick={() => { setShowProfile(false); navigate("/tracker"); }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      📌 My Tracker
                    </button>
                  )}
                  <button
                    onClick={() => { setShowProfile(false); handleLogout(); }}
                    className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-gray-800 transition"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
            {/* END PROFILE MENU */}

          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="px-4 sm:px-6 py-5 max-w-7xl mx-auto">

        {/* SEARCH & FILTERS */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
          <input
            type="text"
            placeholder="Search jobs, skills, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-3 outline-none mb-4"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setView("grid")}
              className={`px-3 sm:px-4 py-2 text-sm rounded-lg ${view === "grid" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
            >
              Grid
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 sm:px-4 py-2 text-sm rounded-lg ${view === "list" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
            >
              List
            </button>
            {["all", "Remote", "Hybrid", "Onsite"].map((type) => (
              <button
                key={type}
                onClick={() => setJobType(type)}
                className={`px-3 sm:px-4 py-2 text-sm rounded-lg ${jobType === type ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
              >
                {type}
              </button>
            ))}
            <button
              onClick={() => setSort("salary-desc")}
              className={`px-3 sm:px-4 py-2 text-sm rounded-lg ${sort === "salary-desc" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
            >
              Salary ↓
            </button>
            <button
              onClick={() => setSort("salary-asc")}
              className={`px-3 sm:px-4 py-2 text-sm rounded-lg ${sort === "salary-asc" ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-800"}`}
            >
              Salary ↑
            </button>
            <button
              onClick={() => { setSearch(""); setSort(""); setJobType("all"); }}
              className="bg-red-500 text-white px-3 sm:px-4 py-2 text-sm rounded-lg"
            >
              Clear
            </button>
          </div>
        </div>

        {/* JOB CARDS */}
        <div
          className={`gap-5 ${
            view === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
              : "flex flex-col"
          }`}
        >
          {paginatedJobs.map((job) => {
            const isBookmarked = bookmarkedJobs.includes(job._id);
            return (
              <div
                key={job._id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition"
              >
                <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                <p className="text-gray-500 text-sm mb-2">📍 {job.location}</p>
                <p className="text-green-600 font-bold text-lg mb-3">₹{job.salary}</p>
                <p className="text-sm mb-4">{job.type}</p>

                {/* SKILLS */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {job.skills?.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-3 py-1 rounded-md text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* BUTTONS */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {role === "user" && (
                    <>
                      <button
                        onClick={() => toggleBookmark(job._id)}
                        className={`px-3 sm:px-4 py-2 text-sm rounded-lg ${
                          isBookmarked
                            ? "bg-yellow-400 text-black"
                            : "bg-gray-200 dark:bg-gray-800"
                        }`}
                      >
                        {isBookmarked ? "Bookmarked" : "Bookmark"}
                      </button>
                      {appliedJobs.includes(job._id) ? (
                        <button
                          onClick={() => withdrawApplication(job._id)}
                          className="bg-green-500 text-white px-3 sm:px-4 py-2 text-sm rounded-lg"
                        >
                          Withdraw
                        </button>
                      ) : (
                        <button
                          onClick={() => openApplyForm(job)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 text-sm rounded-lg"
                        >
                          Apply
                        </button>
                      )}
                    </>
                  )}
                  {role === "admin" && (
                    <button
                      onClick={() => navigate(`/applicants/${job._id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 text-sm rounded-lg"
                    >
                      View Applicants
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="px-3 sm:px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-800 disabled:opacity-40"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`px-4 py-2 text-sm rounded-lg ${
                  page === p
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-800"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-800 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}

      </div>

      {/* APPLY MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-5">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-5">Apply for {selectedJob?.title}</h2>
            <div className="space-y-3">
              <input name="name" placeholder="Name" onChange={handleChange} className="w-full border dark:border-gray-700 dark:bg-gray-800 p-3 rounded-lg" />
              <input name="email" placeholder="Email" onChange={handleChange} className="w-full border dark:border-gray-700 dark:bg-gray-800 p-3 rounded-lg" />
              <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full border dark:border-gray-700 dark:bg-gray-800 p-3 rounded-lg" />
              <input name="address" placeholder="Address" onChange={handleChange} className="w-full border dark:border-gray-700 dark:bg-gray-800 p-3 rounded-lg" />
              <input name="percentage" placeholder="Percentage" onChange={handleChange} className="w-full border dark:border-gray-700 dark:bg-gray-800 p-3 rounded-lg" />
              <input name="resume" placeholder="Resume Link" onChange={handleChange} className="w-full border dark:border-gray-700 dark:bg-gray-800 p-3 rounded-lg" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={submitApplication} className="bg-green-500 text-white w-full py-3 rounded-lg">
                Submit
              </button>
              <button onClick={() => setShowForm(false)} className="bg-red-500 text-white w-full py-3 rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHATBOT */}
      <Chatbot />

    </div>
  );
}

export default Home;