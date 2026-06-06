import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Chatbot from "../components/Chatbot";

function Home() {

  // =====================================
  // STATES
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // NEW
  const [resumeError, setResumeError] = useState(""); // NEW
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    percentage: "",
    resume: "",
  });

  // =====================================
  // AUTH
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
        const activeIds = data
          .filter((app) => app.status !== "Rejected")
          .map((a) => a.jobId);
        setAppliedJobs(activeIds);
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
  // AUTH GUARD
  // =====================================
  if (!token) return <Navigate to="/login" />;

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
        job.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()));
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
  const handlePageChange = (newPage) => setPage(newPage);

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
    const readNotifs = localStorage.getItem("readNotifs");
    localStorage.clear();
    if (readNotifs) localStorage.setItem("readNotifs", readNotifs);
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
    setResumeError("");
    setFormData({ name: "", email: "", phone: "", address: "", percentage: "", resume: "" });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // CLEAR RESUME ERROR WHEN USER TYPES
    if (e.target.name === "resume") setResumeError("");
  };

  // =====================================
  // RESUME URL VALIDATION — NEW
  // =====================================
  const isValidResumeUrl = (url) => {
    return (
      url.startsWith("https://drive.google.com") ||
      url.startsWith("https://www.dropbox.com") ||
      url.startsWith("https://dropbox.com")
    );
  };

  // =====================================
  // SUBMIT APPLICATION
  // =====================================
  const submitApplication = async () => {
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.percentage.trim() ||
      !formData.resume.trim()
    ) {
      alert("Please fill all fields");
      return;
    }

    // RESUME VALIDATION — NEW
    if (!isValidResumeUrl(formData.resume.trim())) {
      setResumeError("Resume link must be a Google Drive or Dropbox URL.");
      return;
    }

    try {
      const res = await fetch(
        "https://job-board-backend-755o.onrender.com/api/apply",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            jobId: selectedJob._id,
            ...formData,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      alert(data.message);
      setAppliedJobs([...appliedJobs, selectedJob._id]);
      setShowForm(false);
      setFormData({ name: "", email: "", phone: "", address: "", percentage: "", resume: "" });
      setResumeError("");
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  // =====================================
  // NOTIFICATIONS
  // =====================================
  const unreadNotifications = notifications.filter(
    (n) => !readNotifications.includes(`${n._id}-${n.status}`)
  );

  const handleNotificationClick = () => {
    const isOpening = !showNotifications;
    setShowNotifications(isOpening);
    if (isOpening) {
      const ids = notifications.map((n) => `${n._id}-${n.status}`);
      setReadNotifications(ids);
      localStorage.setItem("readNotifs", JSON.stringify(ids));
    }
  };

  const statusColors = {
    Shortlisted: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
    Selected: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
    Rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  };

  const jobTypeBadge = {
    Remote: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
    Hybrid: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200",
    Onsite: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-black dark:text-white">

      {/* ===== NAVBAR ===== */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-indigo-100 dark:bg-gray-900/80 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* BRAND */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">J</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate leading-tight">JobBoard</p>
              <p className="text-xs text-slate-400 dark:text-gray-500 truncate leading-tight hidden sm:block">{name}</p>
            </div>
          </div>

          {/* DESKTOP RIGHT ACTIONS */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              🏠 Home
            </button>

            <button
              onClick={toggleDarkMode}
              title="Toggle dark mode"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-base">🌙</span>
            </button>

            {role === "user" && (
              <button
                onClick={() => navigate("/tracker")}
                className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                📌 Tracker
              </button>
            )}

            {role === "admin" && (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/admin-dashboard")}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/add-job")}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  + Add Job
                </button>
              </div>
            )}

            {role === "user" && (
              <div className="relative">
                <button
                  onClick={handleNotificationClick}
                  className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-base">🔔</span>
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-800">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-slate-400 dark:text-gray-500 text-center py-8">No notifications yet</p>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 dark:border-gray-800 last:border-0">
                            <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[n.status] || "bg-slate-100 text-slate-600"}`}>
                              {n.status}
                            </span>
                            <p className="text-sm text-slate-500 dark:text-gray-400">Your application status was updated</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE MENU */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-900 transition-shadow hover:ring-indigo-400"
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </button>

              {showProfile && (
                <div className="absolute right-0 top-12 w-52 bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-indigo-50 dark:bg-gray-800 border-b border-indigo-100 dark:border-gray-700">
                    <p className="font-semibold text-sm truncate">{name}</p>
                    <p className="text-xs text-slate-400 dark:text-gray-500 capitalize">{role}</p>
                  </div>
                  {[
                    { label: "👤 See Profile", action: () => { setShowProfile(false); navigate("/profile"); } },
                    { label: "✏️ Update Profile", action: () => { setShowProfile(false); navigate("/profile"); } },
                    ...(role === "user" ? [{ label: "📌 My Tracker", action: () => { setShowProfile(false); navigate("/tracker"); } }] : []),
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} className="w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors">
                      {item.label}
                    </button>
                  ))}
                  <div className="border-t border-indigo-100 dark:border-gray-700">
                    <button
                      onClick={() => { setShowProfile(false); handleLogout(); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE RIGHT — only bell + hamburger */}
          <div className="flex sm:hidden items-center gap-2">

            {/* NOTIFICATION BELL — mobile */}
            {role === "user" && (
              <div className="relative">
                <button
                  onClick={handleNotificationClick}
                  className="relative w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-base">🔔</span>
                  {unreadNotifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadNotifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-gray-800">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-6">No notifications yet</p>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-slate-50 dark:border-gray-800 last:border-0">
                            <span className={`mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[n.status] || "bg-slate-100 text-slate-600"}`}>
                              {n.status}
                            </span>
                            <p className="text-sm text-slate-500 dark:text-gray-400">Your application status was updated</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HAMBURGER BUTTON */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-indigo-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 space-y-2">

            {/* USER INFO */}
            <div className="flex items-center gap-3 px-2 py-2 mb-1">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                alt="profile"
                className="w-9 h-9 rounded-full ring-2 ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold">{name}</p>
                <p className="text-xs text-slate-400 capitalize">{role}</p>
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-gray-800" />

            {/* NAV LINKS */}
            <button
              onClick={() => { setMobileMenuOpen(false); navigate("/"); }}
              className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
            >
              🏠 Home
            </button>

            {role === "user" && (
              <button
                onClick={() => { setMobileMenuOpen(false); navigate("/tracker"); }}
                className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-amber-50 dark:hover:bg-gray-800 text-amber-700 dark:text-amber-300 transition-colors"
              >
                📌 Tracker
              </button>
            )}

            {role === "admin" && (
              <>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate("/admin-dashboard"); }}
                  className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-violet-50 dark:hover:bg-gray-800 text-violet-700 dark:text-violet-300 transition-colors"
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => { setMobileMenuOpen(false); navigate("/add-job"); }}
                  className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-emerald-50 dark:hover:bg-gray-800 text-emerald-700 dark:text-emerald-300 transition-colors"
                >
                  ➕ Add Job
                </button>
              </>
            )}

            <button
              onClick={() => { setMobileMenuOpen(false); navigate("/profile"); }}
              className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
            >
              👤 Profile
            </button>

            <button
              onClick={toggleDarkMode}
              className="w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
            >
              🌙 Toggle Dark Mode
            </button>

            <div className="h-px bg-slate-100 dark:bg-gray-800" />

            <button
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="w-full text-left px-3 py-2.5 text-sm rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              🚪 Logout
            </button>
          </div>
        )}
      </nav>

      {/* ===== MAIN ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* PAGE HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back, {name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">
            {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* ===== SEARCH & FILTERS ===== */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-indigo-100 dark:border-gray-800 p-4 mb-6 space-y-3 shadow-sm">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search jobs, skills, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-slate-400 transition"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className="flex items-center bg-slate-100 dark:bg-gray-800 rounded-lg p-0.5 flex-shrink-0">
              {["grid", "list"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                    view === v
                      ? "bg-white dark:bg-gray-700 text-slate-800 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {v === "grid" ? "⊞ Grid" : "☰ List"}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-slate-200 dark:bg-gray-700 flex-shrink-0" />

            {["all", "Remote", "Hybrid", "Onsite"].map((type) => (
              <button
                key={type}
                onClick={() => setJobType(type)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-lg font-medium transition-all border ${
                  jobType === type
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600"
                    : "bg-white dark:bg-gray-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-gray-700 hover:border-indigo-300"
                }`}
              >
                {type === "all" ? "All Types" : type}
              </button>
            ))}

            <div className="w-px h-5 bg-slate-200 dark:bg-gray-700 flex-shrink-0" />

            {[
              { key: "salary-desc", label: "Salary ↓" },
              { key: "salary-asc", label: "Salary ↑" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSort(key)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-lg font-medium transition-all border ${
                  sort === key
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600"
                    : "bg-white dark:bg-gray-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-gray-700 hover:border-indigo-300"
                }`}
              >
                {label}
              </button>
            ))}

            {(search || sort || jobType !== "all") && (
              <button
                onClick={() => { setSearch(""); setSort(""); setJobType("all"); }}
                className="flex-shrink-0 px-3 py-1.5 text-xs rounded-lg font-medium bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors"
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        {/* ===== JOB CARDS ===== */}
        {paginatedJobs.length === 0 ? (
          <div className="text-center py-20 text-slate-400 dark:text-gray-600">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg font-medium">No jobs found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className={`gap-4 ${view === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col"}`}>
            {paginatedJobs.map((job) => {
              const isBookmarked = bookmarkedJobs.includes(job._id);
              const isApplied = appliedJobs.includes(job._id);

              return (
                <div
                  key={job._id}
                  className={`group bg-white dark:bg-gray-900 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-indigo-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 ${
                    view === "list" ? "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5" : "p-5 flex flex-col"
                  }`}
                >
                  <div className={view === "list" ? "flex-1 min-w-0" : "flex-1"}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="text-base font-semibold leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {job.title}
                      </h2>
                      {job.type && (
                        <span className={`flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${jobTypeBadge[job.type] || "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                          {job.type}
                        </span>
                      )}
                    </div>

                    {/* COMPANY NAME — NEW */}
                    {job.company && (
                      <p className="text-xs text-slate-400 dark:text-gray-500 mb-2">@ {job.company}</p>
                    )}

                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-gray-400 mb-3">
                      <span>📍 {job.location}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹{job.salary?.toLocaleString()}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {job.skills?.slice(0, 4).map((skill, i) => (
                        <span key={i} className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-2.5 py-0.5 rounded-md text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                      {job.skills?.length > 4 && (
                        <span className="bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 px-2.5 py-0.5 rounded-md text-xs">
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`flex gap-2 ${view === "list" ? "flex-shrink-0 sm:flex-col sm:w-36" : "mt-4"}`}>
                    {role === "user" && (
                      <>
                        <button
                          onClick={() => toggleBookmark(job._id)}
                          className={`flex-1 sm:flex-none px-3 py-2 text-sm rounded-xl font-medium transition-all border ${
                            isBookmarked
                              ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                              : "bg-white dark:bg-gray-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-gray-700 hover:border-amber-300"
                          }`}
                        >
                          {isBookmarked ? "🔖 Saved" : "🔖 Save"}
                        </button>
                        {isApplied ? (
                          <button disabled className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-xl font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed">
                            ✓ Applied
                          </button>
                        ) : (
                          <button
                            onClick={() => openApplyForm(job)}
                            className="flex-1 sm:flex-none px-3 py-2 text-sm rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white transition-all"
                          >
                            Apply →
                          </button>
                        )}
                      </>
                    )}
                    {role === "admin" && (
                      <button
                        onClick={() => navigate(`/applicants/${job._id}`)}
                        className="flex-1 px-3 py-2 text-sm rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white transition-all"
                      >
                        View Applicants
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== PAGINATION ===== */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-8">
            <button
              onClick={() => handlePageChange(Math.max(page - 1, 1))}
              disabled={page === 1}
              className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
            >
              ←
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isNear = Math.abs(p - page) <= 1 || p === 1 || p === totalPages;
              if (!isNear && (p === 2 || p === totalPages - 1)) {
                return <span key={p} className="text-slate-400 px-1">…</span>;
              }
              if (!isNear) return null;
              return (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-9 h-9 text-sm rounded-lg font-medium transition-colors ${
                    page === p
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-900 border border-indigo-100 dark:border-gray-700 text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-indigo-50 dark:hover:bg-gray-800 transition-colors"
            >
              →
            </button>
          </div>
        )}

      </main>

      {/* ===== APPLY MODAL ===== */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-semibold">Apply for Position</h2>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">{selectedJob?.title}</p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {[
                { name: "name", placeholder: "Full name", type: "text" },
                { name: "email", placeholder: "Email address", type: "email" },
                { name: "phone", placeholder: "Phone number", type: "tel" },
                { name: "address", placeholder: "Current address", type: "text" },
                { name: "percentage", placeholder: "Academic percentage (%)", type: "number" },
              ].map((field) => (
                <input
                  key={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-slate-400 transition"
                />
              ))}

              {/* RESUME FIELD WITH VALIDATION — NEW */}
              <div>
                <input
                  name="resume"
                  type="url"
                  placeholder="Resume link (Google Drive / Dropbox only)"
                  value={formData.resume}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-gray-800 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white placeholder-slate-400 transition ${
                    resumeError
                      ? "border-red-400 dark:border-red-500"
                      : "border-slate-200 dark:border-gray-700"
                  }`}
                />
                {resumeError && (
                  <p className="text-xs text-red-500 mt-1 px-1">⚠️ {resumeError}</p>
                )}
                <p className="text-xs text-slate-400 dark:text-gray-500 mt-1 px-1">
                  Only Google Drive or Dropbox links are accepted.
                </p>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-indigo-100 dark:border-gray-800">
              <button
                onClick={() => { setShowForm(false); setResumeError(""); }}
                className="flex-1 py-2.5 text-sm rounded-xl font-medium bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitApplication}
                className="flex-1 py-2.5 text-sm rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white transition-all"
              >
                Submit Application
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