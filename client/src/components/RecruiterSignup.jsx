// Updated RecruiterSignup.jsx with backend integration
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RecruiterSignup = () => {
  const navigate = useNavigate();
  const [loginrecruiterfullName, setRecruiterLoginFullName] = useState("");
  const [loginrecsignuppassword, setRecLoginSignupPassword] = useState("");
  const [loginreccity, setRecLoginCity] = useState("");
  const [loginrecsignupemail, setRecLoginSignupEmail] = useState("");
  const [logrecinage, setRecLoginAge] = useState("");
  const [loading, setLoading] = useState(false);

  const handleloginrecruiterSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    if (/[0-9!@#$%^&*]/.test(loginrecruiterfullName)) {
      alert("Enter a valid name");
      setLoading(false);
      return;
    }
    if (!loginrecsignupemail.endsWith("@gmail.com")) {
      alert("Enter a valid email");
      setLoading(false);
      return;
    }
    if (loginrecsignuppassword.length < 6) {
      alert("Password length should be at least 6 characters");
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(loginrecsignuppassword)) {
      alert("Password should have a capital letter");
      setLoading(false);
      return;
    }
    if (!/[0-9]/.test(loginrecsignuppassword)) {
      alert("Password should have a number");
      setLoading(false);
      return;
    }
    if (!/[!@#$%^&*]/.test(loginrecsignuppassword)) {
      alert("Password must have at least 1 special character");
      setLoading(false);
      return;
    }
    if (!logrecinage || logrecinage < 18 || logrecinage > 100) {
      alert("Please enter a valid age (18-100)");
      setLoading(false);
      return;
    }

    try {
      // Send request to backend
      const response = await fetch("http://localhost:5000/api/auth/recruiter/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loginrecruiterfullName,
          loginrecsignupemail,
          loginrecsignuppassword,
          loginreccity,
          logrecinage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Recruiter signup successful! Please login now.");
        navigate("/recruiterlogin");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Recruiter signup error:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          onClick={() => navigate("/")}
          aria-label="Close signup form"
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-6 text-center text-green-600">
          Recruiter Signup
        </h2>

        <form onSubmit={handleloginrecruiterSignup} className="flex flex-col space-y-4">
          <label htmlFor="fullName">Full Name:</label>
          <input
            id="fullName"
            type="text"
            value={loginrecruiterfullName}
            onChange={(e) => setRecruiterLoginFullName(e.target.value)}
            placeholder="Enter your full name"
            required
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={loading}
          />

          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={loginrecsignupemail}
            onChange={(e) => setRecLoginSignupEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={loading}
          />

          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={loginrecsignuppassword}
            onChange={(e) => setRecLoginSignupPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={loading}
          />

          <label htmlFor="city">City:</label>
          <input
            id="city"
            type="text"
            value={loginreccity}
            onChange={(e) => setRecLoginCity(e.target.value)}
            placeholder="Enter your city"
            required
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={loading}
          />

          <label htmlFor="age">Age:</label>
          <input
            id="age"
            type="number"
            value={logrecinage}
            onChange={(e) => setRecLoginAge(e.target.value)}
            placeholder="Enter your age"
            required
            min="18"
            max="100"
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            disabled={loading}
          />

          <button
            type="submit"
            className="bg-green-700 text-white py-2 rounded hover:bg-green-600 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up as Recruiter"}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/recruiterlogin")}
              className="text-green-600 hover:underline"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecruiterSignup;