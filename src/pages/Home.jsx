import { useState, useEffect } from "react";
import data from "../data/mock-data.json";

function Home() {
  const allJobs = data.jobs;

  const [view, setView] = useState("grid");
  const [jobType, setJobType] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);

  const jobsPerPage = 2;

  // Load from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("bookmarkedJobs")) || [];
    setBookmarkedJobs(saved);
  }, []);

  // Toggle bookmark
  const toggleBookmark = (id) => {
    let updated;

    if (bookmarkedJobs.includes(id)) {
      updated = bookmarkedJobs.filter((jobId) => jobId !== id);
    } else {
      updated = [...bookmarkedJobs, id];
    }

    setBookmarkedJobs(updated);
    localStorage.setItem("bookmarkedJobs", JSON.stringify(updated));
  };

  // Filter + Search
  let filteredJobs = allJobs
    .filter((job) =>
      jobType === "all" ? true : job.jobType === jobType
    )
    .filter((job) =>
      job.title.toLowerCase().includes(search.toLowerCase())
    );

  // Sorting
  if (sort === "salary-desc") {
    filteredJobs = [...filteredJobs].sort(
      (a, b) => b.salary - a.salary
    );
  }

  // Pagination
  const startIndex = (page - 1) * jobsPerPage;
  const paginatedJobs = filteredJobs.slice(
    startIndex,
    startIndex + jobsPerPage
  );

  // ✅ FIX ADDED HERE
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  return (
  <div className="p-6 bg-gray-100 min-h-screen">
    <h2 className="text-3xl font-bold mb-4">Job Listings</h2>

    {/* Search */}
    <input
      className="border p-2 rounded w-full mb-4"
      type="text"
      placeholder="Search jobs..."
      data-testid="search-input"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

    {/* Buttons */}
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        data-testid="grid-view-btn"
        onClick={() => setView("grid")}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Grid
      </button>

      <button
        data-testid="list-view-btn"
        onClick={() => setView("list")}
        className="bg-green-500 text-white px-3 py-1 rounded"
      >
        List
      </button>

      <button
        data-testid="sort-salary-desc"
        onClick={() => setSort("salary-desc")}
        className="bg-purple-500 text-white px-3 py-1 rounded"
      >
        Sort Salary ↓
      </button>

      <button
        data-testid="clear-filters-btn"
        onClick={() => {
          setJobType("all");
          setSearch("");
          setSort("");
          setPage(1);
        }}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Clear Filters
      </button>
    </div>

    {/* Filters */}
    <div className="mb-4 flex gap-4">
      <label>
        <input type="radio" checked={jobType === "all"} onChange={() => setJobType("all")} /> All
      </label>
      <label>
        <input type="radio" data-testid="filter-job-type-remote" onChange={() => setJobType("Remote")} /> Remote
      </label>
      <label>
        <input type="radio" data-testid="filter-job-type-hybrid" onChange={() => setJobType("Hybrid")} /> Hybrid
      </label>
      <label>
        <input type="radio" onChange={() => setJobType("Onsite")} /> Onsite
      </label>
    </div>

    {/* Job List */}
    <div
      data-testid="job-list-container"
      data-view-mode={view}
      className={`gap-4 ${
        view === "grid" ? "grid grid-cols-1 md:grid-cols-3" : "flex flex-col"
      }`}
    >
      {paginatedJobs.map((job) => {
        const isBookmarked = bookmarkedJobs.includes(job.id);

        return (
          <div
            key={job.id}
            data-testid={`job-card-${job.id}`}
            className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-gray-600">{job.location}</p>
            <p className="text-green-600 font-bold">₹{job.salary}</p>
            <p className="text-sm">{job.jobType}</p>

            <div className="flex flex-wrap gap-2 mt-2">
              {job.skills.map((skill, i) => (
                <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm">
                  {skill}
                </span>
              ))}
            </div>

            <button
              data-testid={`bookmark-btn-${job.id}`}
              data-bookmarked={isBookmarked}
              onClick={() => toggleBookmark(job.id)}
              className={`mt-3 px-3 py-1 rounded ${
                isBookmarked ? "bg-yellow-400" : "bg-gray-300"
              }`}
            >
              {isBookmarked ? "Bookmarked" : "Bookmark"}
            </button>
          </div>
        );
      })}
    </div>

    {/* Pagination */}
    <div className="mt-6 flex gap-2">
      {page > 1 && (
        <button
          onClick={() => setPage(page - 1)}
          className="bg-gray-400 px-3 py-1 rounded"
        >
          Previous
        </button>
      )}

      {page < totalPages && (
        <button
          data-testid="pagination-next"
          onClick={() => setPage(page + 1)}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Next
        </button>
      )}
    </div>
  </div>
);
}

export default Home;