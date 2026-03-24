import { useEffect, useState } from "react";
import data from "../data/mock-data.json";

function Tracker() {
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("bookmarkedJobs")) || [];
    setBookmarkedJobs(saved);
  }, []);

  const jobs = data.jobs;

  const filteredJobs = jobs.filter((job) =>
    bookmarkedJobs.includes(job.id)
  );

  return (
    <div>
      <h2>Bookmarked Jobs</h2>
      
      {filteredJobs.length === 0 ? (
        <p>No bookmarked jobs</p>
      ) : (
        filteredJobs.map((job) => (
          <div
            key={job.id}
            data-testid={`job-card-${job.id}`}
            style={{
              border: "1px solid black",
              margin: "10px",
              padding: "10px",
            }}
          >
            <h3>{job.title}</h3>
            <p>Location: {job.location}</p>
            <p>Salary: {job.salary}</p>
            <p>Type: {job.jobType}</p>
            <p>Skills: {job.skills.join(", ")}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Tracker;