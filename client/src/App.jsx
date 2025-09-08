// Updated App.jsx with all routes for React Router
import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import ApplyJob from "./pages/ApplyJob";
import Application from "./pages/Application";
import Profile from "./pages/Profile";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import Signup from "./components/Signup";
import Login from "./components/Login";
import RecruiterLogin from "./components/RecruiterLogin";
import RecruiterSignup from "./components/RecruiterSignup";
import Forgotpassword from "./components/Forgotpassword";

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ApplyJob/:id" element={<ApplyJob />} />
        <Route path="/Application" element={<Application />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Forgotpassword" element={<Forgotpassword />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recruiterlogin" element={<RecruiterLogin />} />
        <Route path="/recruitersignup" element={<RecruiterSignup />} />
      </Routes>
    </div>
  );
};

export default App;