import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 py-5">
        <h1 className="text-2xl font-bold">
          Job Board
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-blue-700 px-4 py-2 rounded-xl font-semibold"
          >
            Login
          </button>

          <button
            onClick={() => navigate("/register")}
            className="bg-yellow-400 text-black px-4 py-2 rounded-xl font-semibold"
          >
            Register
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center px-6 py-20">

        <h1 className="text-5xl font-bold mb-6">
          Find Your Dream Job 🚀
        </h1>

        <p className="max-w-2xl mx-auto text-lg text-gray-100 mb-8">
          Search thousands of jobs, apply instantly,
          track applications, receive notifications
          and manage your career journey in one place.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">

          <button
            onClick={() => navigate("/register")}
            className="bg-white text-blue-700 px-8 py-3 rounded-2xl font-bold"
          >
            Get Started
          </button>

          <button
            onClick={() => navigate("/login")}
            className="bg-yellow-400 text-black px-8 py-3 rounded-2xl font-bold"
          >
            Login
          </button>

        </div>

      </section>

      {/* FEATURES */}
      <section className="px-6 pb-20">

        <h2 className="text-3xl font-bold text-center mb-10">
          Features
        </h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl">
            <h3 className="text-xl font-bold mb-3">
              🔍 Smart Job Search
            </h3>
            <p>
              Search jobs by skills, location,
              salary and job type.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl">
            <h3 className="text-xl font-bold mb-3">
              📌 Application Tracker
            </h3>
            <p>
              Track every application in
              real-time.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl">
            <h3 className="text-xl font-bold mb-3">
              🔔 Notifications
            </h3>
            <p>
              Get status updates for
              shortlisted, selected and
              rejected applications.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl">
            <h3 className="text-xl font-bold mb-3">
              ❤️ Bookmark Jobs
            </h3>
            <p>
              Save interesting jobs and
              apply later.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl">
            <h3 className="text-xl font-bold mb-3">
              👤 Profile Management
            </h3>
            <p>
              Maintain your resume and
              personal details.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl">
            <h3 className="text-xl font-bold mb-3">
              📊 Recruiter Dashboard
            </h3>
            <p>
              Manage jobs and applicants
              efficiently.
            </p>
          </div>

        </div>

      </section>

      {/* STATS */}
      {/* <section className="bg-black/20 py-12">

        <div className="grid grid-cols-2 md:grid-cols-4 text-center gap-6 max-w-5xl mx-auto">

          <div>
            <h2 className="text-4xl font-bold">1000+</h2>
            <p>Jobs</p>
          </div>

          <div>
            <h2 className="text-4xl font-bold">500+</h2>
            <p>Companies</p>
          </div>

          <div>
            <h2 className="text-4xl font-bold">10K+</h2>
            <p>Applications</p>
          </div>

          <div>
            <h2 className="text-4xl font-bold">95%</h2>
            <p>Satisfaction</p>
          </div>

        </div>

      </section> */}

      {/* FOOTER */}
      <footer className="text-center py-8 text-gray-200">
        © 2026 Job Board Application
      </footer>

    </div>
  );
}

export default LandingPage;