// Updated Navbar.jsx with My Account and Logout functionality
import React from "react";
import { assets } from "../assets/assets";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  // Check if user is logged in by checking localStorage
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;
  const userType = localStorage.getItem("userType");

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        // Call backend logout API
        await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userType");

      alert("You have been successfully logged out!");
      navigate("/");
      window.location.reload();
    }
  };

  const handleMyAccount = () => {
    if (userType === "recruiter") {
      navigate("/recruiter-dashboard");
    } else {
      navigate("/profile");
    }
  };

  return (
    <nav>
      <div className="shadow py-4">
        <div className="container px-4 2xl:px-20 mx-auto flex justify-between items-center">
          <Link to="/">
            <img src={assets.logo} alt="Company Logo" />
          </Link>

          <div className="flex gap-4 max-sm:text-xs items-center">
            {token ? (
              // Show when user is logged in
              <>
                <span className="text-gray-600 max-sm:hidden">
                  Welcome,{" "}
                  {user?.loginfullName ||
                    user?.loginrecruiterfullName ||
                    user?.loginEmail?.split("@")[0]}
                  !
                </span>
                <button
                  onClick={handleMyAccount}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-500 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Jobs
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 rounded-full transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              // Show when user is not logged in
              <>
                <Link
                  to="/recruiterlogin"
                  className="text-gray-400 hover:text-blue-500 hover:p-1 hover:border rounded transition-all duration-200"
                >
                  Recruiter Login
                </Link>
                <Link
                  to="/login"
                  className="text-white bg-blue-700 hover:bg-blue-800 px-6 sm:px-9 py-2 rounded-full transition-all duration-200"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
