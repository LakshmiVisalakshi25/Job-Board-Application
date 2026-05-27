import { useState } from "react";

import {
  useNavigate
} from "react-router-dom";

function Login() {

  // ===============================
  // STATES
  // ===============================
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  // FORGOT PASSWORD
  const [showForgot,
    setShowForgot] =
    useState(false);

  const [forgotEmail,
    setForgotEmail] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [newPassword,
    setNewPassword] =
    useState("");

  const [otpSent,
    setOtpSent] =
    useState(false);

  const navigate =
    useNavigate();

  // ===============================
  // LOGIN
  // ===============================
  const handleLogin =
    async () => {

      try {

        if (
          !email ||
          !password
        ) {

          alert(
            "Please fill all fields"
          );

          return;
        }

        setLoading(true);

        const res =
          await fetch(
            "https://job-board-backend-755o.onrender.com//api/login",
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                email,
                password
              })
            }
          );

        const data =
          await res.json();

        if (!res.ok) {

          alert(
            data.message ||
            "Login failed"
          );

          return;
        }

        // STORE AUTH
        localStorage.setItem(
          "token",
          data.token
        );

        localStorage.setItem(
          "userId",
          data.userId
        );

        localStorage.setItem(
          "role",
          data.role
        );

        localStorage.setItem(
          "name",
          data.name
        );

        alert(
          "Login successful ✅"
        );

        navigate("/");

      } catch (err) {

        console.log(err);

        alert(
          "Something went wrong"
        );

      } finally {

        setLoading(false);
      }
    };

  // ===============================
  // SEND OTP
  // ===============================
  const sendOtp =
    async () => {

      try {

        if (!forgotEmail) {

          alert(
            "Enter email"
          );

          return;
        }

        const res =
          await fetch(
            "https://job-board-backend-755o.onrender.com//api/send-otp",
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

                email:
                  forgotEmail

              })
            }
          );

        const data =
          await res.json();

        if (!res.ok) {

          alert(
            data.message
          );

          return;
        }

        alert(
          "OTP sent to your email ✅"
        );

        setOtpSent(true);

      } catch (err) {

        console.log(err);

        alert(
          "Failed to send OTP"
        );
      }
    };

  // ===============================
  // RESET PASSWORD
  // ===============================
  const resetPassword =
    async () => {

      try {

        if (
          !otp ||
          !newPassword
        ) {

          alert(
            "Fill all fields"
          );

          return;
        }

        const res =
          await fetch(
            "https://job-board-backend-755o.onrender.com//api/reset-password",
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

                email:
                  forgotEmail,

                otp,

                newPassword

              })
            }
          );

        const data =
          await res.json();

        if (!res.ok) {

          alert(
            data.message
          );

          return;
        }

        alert(
          "Password reset successful ✅"
        );

        setShowForgot(false);

        setOtpSent(false);

        setForgotEmail("");

        setOtp("");

        setNewPassword("");

      } catch (err) {

        console.log(err);

        alert(
          "Reset failed"
        );
      }
    };

  return (

    <div className="min-h-screen flex justify-center items-center bg-gray-100 dark:bg-gray-900 p-6 transition duration-300">

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 w-full max-w-md">

        {/* HEADING */}
        <h2 className="text-3xl font-bold mb-2 text-center dark:text-white">

          AI Job Portal

        </h2>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-6">

          Login to continue

        </p>

        {/* DEMO */}
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-5">

          <p className="font-bold mb-2 dark:text-white">

            Demo Credentials

          </p>

          <p className="text-sm dark:text-gray-200">

            User:
            user@test.com / user123

          </p>

          <p className="text-sm dark:text-gray-200">

            Admin:
            admin@test.com / admin123

          </p>

        </div>

        {/* DEMO BUTTONS */}
        <div className="flex gap-2 mb-5">

          <button
            onClick={() => {

              setEmail(
                "user@test.com"
              );

              setPassword(
                "user123"
              );
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded w-full"
          >
            Demo User
          </button>

          <button
            onClick={() => {

              setEmail(
                "admin@test.com"
              );

              setPassword(
                "admin123"
              );
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded w-full"
          >
            Demo Admin
          </button>

        </div>

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          className="border p-3 rounded-lg w-full mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          className="border p-3 rounded-lg w-full mb-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />

        {/* FORGOT PASSWORD */}
        <div className="text-right mb-4">

          <button
            onClick={() =>
              setShowForgot(true)
            }
            className="text-blue-500 text-sm hover:underline"
          >
            Forgot Password?
          </button>

        </div>

        {/* LOGIN */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white w-full py-3 rounded-lg transition"
        >

          {loading
            ? "Logging in..."
            : "Login"}

        </button>

        {/* REGISTER */}
        <p className="text-center mt-5 text-sm dark:text-gray-300">

          Don’t have an account?{" "}

          <span
            onClick={() =>
              navigate("/register")
            }
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Register
          </span>

        </p>

      </div>

      {/* FORGOT PASSWORD MODAL */}
      {showForgot && (

        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-5">

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md">

            <h2 className="text-2xl font-bold mb-5 dark:text-white">

              Forgot Password

            </h2>

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Enter email"
              value={forgotEmail}
              onChange={(e) =>
                setForgotEmail(
                  e.target.value
                )
              }
              className="border p-3 rounded-lg w-full mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />

            {/* SEND OTP */}
            {!otpSent && (

              <button
                onClick={sendOtp}
                className="bg-blue-500 text-white w-full py-3 rounded-lg mb-3"
              >
                Send OTP
              </button>

            )}

            {/* OTP + NEW PASSWORD */}
            {otpSent && (

              <>

                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(
                      e.target.value
                    )
                  }
                  className="border p-3 rounded-lg w-full mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(
                      e.target.value
                    )
                  }
                  className="border p-3 rounded-lg w-full mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />

                <button
                  onClick={
                    resetPassword
                  }
                  className="bg-green-500 text-white w-full py-3 rounded-lg mb-3"
                >
                  Reset Password
                </button>

              </>

            )}

            {/* CLOSE */}
            <button
              onClick={() => {

                setShowForgot(
                  false
                );

                setOtpSent(
                  false
                );

              }}
              className="bg-red-500 text-white w-full py-3 rounded-lg"
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default Login;