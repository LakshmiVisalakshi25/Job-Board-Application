import { useEffect, useState } from "react";

import {
  useParams,
  useNavigate
} from "react-router-dom";

function Applicants() {

  const { jobId } =
    useParams();

  const navigate =
    useNavigate();

  const [applications,
    setApplications] =
    useState([]);

  // ===============================
  // FETCH APPLICATIONS
  // ===============================
  const fetchApplications =
    () => {

      fetch(
        `https://job-board-backend-755o.onrender.com/api/applications/${jobId}`
      )
        .then((res) =>
          res.json()
        )
        .then((data) => {

          setApplications(
            data
          );

        })
        .catch((err) =>
          console.log(err)
        );
    };

  useEffect(() => {

    fetchApplications();

  }, [jobId]);

  // ===============================
  // UPDATE STATUS
  // ===============================
  const updateStatus =
    async (
      applicationId,
      status,
      email,
      name
    ) => {

      try {

        const res =
          await fetch(
            "https://job-board-backend-755o.onrender.com/api/application-status",
            {

              method: "PUT",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

                applicationId,

                status,

                email,

                name

              })
            }
          );

        const data =
          await res.json();

        alert(
          data.message
        );

        fetchApplications();

      } catch (err) {

        console.log(err);

        alert(
          "Status update failed"
        );
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

    <div className="p-6 bg-gray-100 dark:bg-gray-900 dark:text-white min-h-screen transition duration-300">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <div>

          <h2 className="text-3xl font-bold">

            Applicants

          </h2>

          <p className="text-gray-600 dark:text-gray-300 mt-1">

            Manage all applicants

          </p>

        </div>

        <button
          onClick={() =>
            navigate("/")
          }
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
        >
          Back
        </button>

      </div>

      {/* NO APPLICANTS */}
      {applications.length === 0 ? (

        <div className="flex justify-center items-center mt-20">

          <h2 className="text-3xl font-bold">

            No Applicants Yet 📄

          </h2>

        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {applications.map((app, i) => (

            <div
              key={i}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 transition hover:shadow-xl"
            >

              {/* NAME */}
              <div className="flex justify-between items-center mb-4">

                <h3 className="text-2xl font-bold">

                  {app.name}

                </h3>

                {/* STATUS */}
                <span
                  className={`${getStatusColor(app.status)} text-white px-3 py-1 rounded-full text-sm`}
                >
                  {app.status}
                </span>

              </div>

              {/* EMAIL */}
              <p className="mb-2">

                <strong>
                  Email:
                </strong>{" "}

                {app.email}

              </p>

              {/* PHONE */}
              <p className="mb-2">

                <strong>
                  Phone:
                </strong>{" "}

                {app.phone}

              </p>

              {/* ADDRESS */}
              <p className="mb-2">

                <strong>
                  Address:
                </strong>{" "}

                {app.address}

              </p>

              {/* PERCENTAGE */}
              <p className="mb-2">

                <strong>
                  Percentage:
                </strong>{" "}

                <span className="text-green-600 font-semibold">

                  {app.percentage}

                </span>

              </p>

              {/* DATE */}
              <p className="mb-4">

                <strong>
                  Applied At:
                </strong>{" "}

                {
                  new Date(
                    app.appliedAt
                  ).toLocaleString()
                }

              </p>

              {/* RESUME */}
              <a
                href={app.resume}
                target="_blank"
                rel="noreferrer"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition mb-5"
              >
                View Resume
              </a>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-2 gap-3">

                {/* SHORTLIST */}
                <button
                  onClick={() =>
                    updateStatus(

                      app._id,

                      "Shortlisted",

                      app.email,

                      app.name

                    )
                  }
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
                >
                  Shortlist
                </button>

                {/* REJECT */}
                <button
                  onClick={() =>
                    updateStatus(

                      app._id,

                      "Rejected",

                      app.email,

                      app.name

                    )
                  }
                  className="bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
                >
                  Reject
                </button>

                {/* SELECT */}
                <button
                  onClick={() =>
                    updateStatus(

                      app._id,

                      "Selected",

                      app.email,

                      app.name

                    )
                  }
                  className="bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                >
                  Select
                </button>

                {/* PENDING */}
                <button
                  onClick={() =>
                    updateStatus(

                      app._id,

                      "Pending",

                      app.email,

                      app.name

                    )
                  }
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg"
                >
                  Pending
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Applicants;