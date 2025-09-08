// Updated Signup.jsx with backend integration
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [loginfullName, setLoginFullName] = useState("");
  const [loginsignuppassword, setLoginSignupPassword] = useState("");
  const [logincity, setLoginCity] = useState("");
  const [loginsignupemail, setLoginSignupEmail] = useState("");
  const [loginage, setLoginAge] = useState("");
  const [loading, setLoading] = useState(false);

  const handleloginSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation (keep your existing validation)
    if (/[0-9!@#$%^&*]/.test(loginfullName)) {
      alert("Enter a valid name");
      setLoading(false);
      return;
    }
    if (!loginsignupemail.endsWith("@gmail.com")) {
      alert("Enter a valid email");
      setLoading(false);
      return;
    }
    if (loginsignuppassword.length < 6) {
      alert("Password length should be at least 6 characters");
      setLoading(false);
      return;
    }
    if (!/[A-Z]/.test(loginsignuppassword)) {
      alert("Password should have a capital letter");
      setLoading(false);
      return;
    }

    try {
      // Send request to backend
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginfullName,
          loginsignupemail,
          loginsignuppassword,
          logincity,
          loginage
        })
      });

      const data = await response.json();

      if (data.success) {
        alert("Signup successful! Please login now.");
        navigate("/login");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 min-h-screen flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-lg flex flex-col space-y-4">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
          onClick={() => navigate("/login")}
          aria-label="Close signup"
        >
          &times;
        </button>
        <h1 className="text-2xl font-bold mb-6 text-center">Signup Page</h1>

        <form onSubmit={handleloginSignup} className="flex flex-col space-y-4">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            placeholder="Enter your Full Name"
            value={loginfullName}
            onChange={(e) => setLoginFullName(e.target.value)}
            required
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />

          <label htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            placeholder="Enter your city"
            value={logincity}
            onChange={(e) => setLoginCity(e.target.value)}
            required
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={loginsignupemail}
            onChange={(e) => setLoginSignupEmail(e.target.value)}
            required
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={loginsignuppassword}
            onChange={(e) => setLoginSignupPassword(e.target.value)}
            required
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />

          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            placeholder="Enter your age"
            min={1}
            step={1}
            value={loginage}
            onChange={(e) => setLoginAge(e.target.value)}
            required
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />

          <button
            type="submit"
            className="border rounded bg-blue-700 text-white p-2 hover:bg-blue-600 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;