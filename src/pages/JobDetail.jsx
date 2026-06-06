import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [resumeError, setResumeError] = useState(""); // NEW
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "", percentage: "", resume: "",
  });

  // ── fetch job ──────────────────────────────────────────────
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`https://job-board-backend-755o.onrender.com/api/jobs/${id}`);
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  // ── fetch bookmarks ────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    fetch(`https://job-board-backend-755o.onrender.com/api/bookmarks/${userId}`)
      .then((r) => r.json())
      .then((data) => setBookmarkedJobs(data.map((b) => b.jobId)));
  }, [userId]);

  // ── fetch applications ─────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    fetch(`https://job-board-backend-755o.onrender.com/api/user-applications/${userId}`)
      .then((r) => r.json())
      .then((data) => {
        const activeIds = data
          .filter((app) => app.status !== "Rejected")
          .map((a) => a.jobId);
        setAppliedJobs(activeIds);
      });
  }, [userId]);

  if (!token) { navigate("/login"); return null; }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-black">
      <p className="text-slate-400 text-sm animate-pulse">Loading job details…</p>
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-slate-400">Job not found.</p>
    </div>
  );

  const isBookmarked = bookmarkedJobs.includes(job._id);
  const isApplied = appliedJobs.includes(job._id);

  const jobTypeBadge = {
    Remote: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200",
    Hybrid: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200",
    Onsite: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200",
  };

  // ── bookmark toggle ────────────────────────────────────────
  const toggleBookmark = async () => {
    try {
      if (isBookmarked) {
        await fetch("https://job-board-backend-755o.onrender.com/api/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, jobId: job._id }),
        });
        setBookmarkedJobs(bookmarkedJobs.filter((bid) => bid !== job._id));
      } else {
        await fetch("https://job-board-backend-755o.onrender.com/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, jobId: job._id }),
        });
        setBookmarkedJobs([...bookmarkedJobs, job._id]);
      }
    } catch (err) { console.log(err); }
  };

  // ── resume validation — NEW ────────────────────────────────
  const isValidResumeUrl = (url) => {
    return (
      url.startsWith("https://drive.google.com") ||
      url.startsWith("https://www.dropbox.com") ||
      url.startsWith("https://dropbox.com")
    );
  };

  // ── apply ──────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "resume") setResumeError("");
  };

  const submitApplication = async () => {
    if (Object.values(formData).some((v) => !v.trim())) {
      alert("Please fill all fields");
      return;
    }

    // RESUME VALIDATION — NEW
    if (!isValidResumeUrl(formData.resume.trim())) {
      setResumeError("Resume link must be a Google Drive or Dropbox URL.");
      return;
    }

    try {
      const res = await fetch("https://job-board-backend-755o.onrender.com/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, jobId: job._id, ...formData }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      alert(data.message);
      setAppliedJobs([...appliedJobs, job._id]);
      setShowForm(false);
      setResumeError("");
      setFormData({ name: "", email: "", phone: "", address: "", percentage: "", resume: "" });
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-black dark:text-white">

      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-indigo-100 dark:bg-gray-900/80 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors text-slate-500 dark:text-slate-400"
          >
            ←
          </button>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Job Details</span>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-indigo-100 dark:border-gray-800 shadow-xl overflow-hidden">

          {/* HEADER BAND */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
                  {job.title}
                </h1>

                {/* COMPANY NAME — NEW */}
                {job.company && (
                  <p className="text-indigo-200 text-sm font-medium mt-1">
                    🏢 {job.company}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-2 text-indigo-200 text-sm">
                  <span>📍 {job.location}</span>
                  <span className="text-white font-semibold">
                    ₹{job.salary?.toLocaleString()}
                  </span>
                </div>
              </div>

              {job.type && (
                <span className={`flex-shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${jobTypeBadge[job.type] || "bg-slate-100 text-slate-600"}`}>
                  {job.type}
                </span>
              )}
            </div>
          </div>

          {/* BODY */}
          <div className="px-6 py-6 space-y-6">

            {/* SKILLS */}
            {job.skills?.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Skills Required
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, i) => (
                    <span key={i} className="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-lg text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* DESCRIPTION */}
            {job.description ? (
              <div>
                <h2 className="text-sm font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  About this Role
                </h2>
                <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            ) : (
              // FALLBACK if no description — NEW
              <div className="bg-slate-50 dark:bg-gray-800 rounded-xl px-4 py-4">
                <p className="text-sm text-slate-400 dark:text-gray-500 italic">
                  No description provided for this role. Contact the company for more details.
                </p>
              </div>
            )}

            {/* DETAILS GRID — company added — NEW */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Company",  value: job.company },
                { label: "Job Type", value: job.type },
                { label: "Location", value: job.location },
                { label: "Salary",   value: job.salary ? `₹${job.salary.toLocaleString()}` : null },
              ].filter((d) => d.value).map((d, i) => (
                <div key={i} className="bg-slate-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                  <p className="text-xs text-slate-400 dark:text-gray-500 mb-0.5">{d.label}</p>
                  <p className="text-sm font-semibold">{d.value}</p>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            {role === "user" && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={toggleBookmark}
                  className={`flex-1 py-2.5 text-sm rounded-xl font-medium transition-all border ${
                    isBookmarked
                      ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                      : "bg-white dark:bg-gray-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-gray-700 hover:border-amber-300"
                  }`}
                >
                  {isBookmarked ? "🔖 Saved" : "🔖 Save Job"}
                </button>

                {isApplied ? (
                  <button disabled className="flex-1 py-2.5 text-sm rounded-xl font-medium bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed">
                    ✓ Already Applied
                  </button>
                ) : (
                  <button
                    onClick={() => { setShowForm(true); setResumeError(""); }}
                    className="flex-1 py-2.5 text-sm rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white transition-all"
                  >
                    Apply Now →
                  </button>
                )}
              </div>
            )}

            {role === "admin" && (
              <button
                onClick={() => navigate(`/applicants/${job._id}`)}
                className="w-full py-2.5 text-sm rounded-xl font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white transition-all"
              >
                View Applicants
              </button>
            )}
          </div>
        </div>
      </main>

      {/* APPLY MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
        >
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-100 dark:border-gray-800">
              <div>
                <h2 className="text-base font-semibold">Apply for Position</h2>
                <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">{job.title}</p>
              </div>
              <button
                onClick={() => { setShowForm(false); setResumeError(""); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {[
                { name: "name",       placeholder: "Full name",                  type: "text"   },
                { name: "email",      placeholder: "Email address",              type: "email"  },
                { name: "phone",      placeholder: "Phone number",               type: "tel"    },
                { name: "address",    placeholder: "Current address",            type: "text"   },
                { name: "percentage", placeholder: "Academic percentage (%)",    type: "number" },
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

              {/* RESUME WITH VALIDATION — NEW */}
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
                className="flex-1 py-2.5 text-sm rounded-xl font-medium bg-slate-100 dark:bg-gray-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
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
    </div>
  );
}

export default JobDetail;