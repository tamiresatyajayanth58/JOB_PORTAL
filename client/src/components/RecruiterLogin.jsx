// Updated RecruiterLogin.jsx with backend integration
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const RecruiterLogin = () => {
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [recruiterPassword, setRecruiterPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRecruiterLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    if (!recruiterEmail.endsWith("@gmail.com")) {
      alert("Enter a valid email");
      setLoading(false);
      return;
    }
    if (recruiterPassword.length < 6) {
      alert("Password length should be at least 6 characters");
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(recruiterPassword)) {
      alert("Password should have a capital letter");
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(recruiterPassword)) {
      alert("Password should have a number");
      setLoading(false);
      return;
    }
    if (!/[!@#$%^&*]/.test(recruiterPassword)) {
      alert("Password must have at least 1 special character");
      setLoading(false);
      return;
    }

    try {
      // Send request to backend
      const response = await fetch("http://localhost:5000/api/auth/recruiter/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recruiterEmail,
          recruiterPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user data in localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userType", "recruiter");

        alert("Recruiter sign in successful");
        navigate("/recruiter-dashboard");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Recruiter login error:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          onClick={() => navigate("/")}
          aria-label="Close login form"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-center text-green-600">
          Recruiter Login
        </h2>

        <form onSubmit={handleRecruiterLogin} className="flex flex-col space-y-4">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={recruiterEmail}
            onChange={(e) => setRecruiterEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={loading}
          />

          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={recruiterPassword}
            onChange={(e) => setRecruiterPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={loading}
          />

          <button
            type="submit"
            className="bg-green-700 text-white py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login as Recruiter"}
          </button>
        </form>
        
        <div className="mt-4 flex justify-between items-center">
          <Link to="/recruiter-forgot-password" className="text-green-600 hover:underline">
            Forgot Password?
          </Link>
          <Link
            to="/recruitersignup"
            className="border border-green-600 text-green-600 rounded px-4 py-1 hover:bg-green-50 transition"
          >
            Signup as Recruiter
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecruiterLogin;