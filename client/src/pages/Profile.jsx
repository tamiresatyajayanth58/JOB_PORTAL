// Enhanced Profile.jsx with Beautiful UI
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [availableJobs, setAvailableJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const userType = localStorage.getItem("userType");
    
    if (!token || !userData || userType !== "user") {
      alert("Please login as a user to access your profile");
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Fetch data from backend
    fetchJobs();
    fetchAppliedJobs();
    fetchSavedJobs();
  }, [navigate]);

  const fetchJobs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppliedJobs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/applications/user", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppliedJobs(data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching applied jobs:", error);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/saved-jobs", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavedJobs(data.savedJobs || []);
      }
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
    }
  };

  const applyForJob = async (job) => {
    try {
      const response = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Show success notification
        showNotification(`Successfully applied for ${job.title} at ${job.company}!`, 'success');
        fetchAppliedJobs(); // Refresh applied jobs
      } else {
        showNotification(data.message || "Failed to apply for job", 'error');
      }
    } catch (error) {
      console.error("Error applying for job:", error);
      showNotification("Network error. Please try again.", 'error');
    }
  };

  const saveJob = async (job) => {
    try {
      const response = await fetch("http://localhost:5000/api/saved-jobs", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: job.id,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        showNotification("Job saved successfully!", 'success');
        fetchSavedJobs(); // Refresh saved jobs
      } else {
        showNotification(data.message || "Failed to save job", 'error');
      }
    } catch (error) {
      console.error("Error saving job:", error);
      showNotification("Network error. Please try again.", 'error');
    }
  };

  const removeSavedJob = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/saved-jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchSavedJobs(); // Refresh saved jobs
        showNotification("Job removed from saved list", 'success');
      } else {
        showNotification("Failed to remove saved job", 'error');
      }
    } catch (error) {
      console.error("Error removing saved job:", error);
      showNotification("Network error. Please try again.", 'error');
    }
  };

  const showNotification = (message, type) => {
    // Simple notification - you can enhance this with a proper notification system
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'success' ? 'notification-success' : 'notification-error'}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 4000);
  };

  const isJobApplied = (jobId) => {
    return appliedJobs.some(app => app.job_id === jobId);
  };

  const isJobSaved = (jobId) => {
    return savedJobs.some(saved => saved.job_id === jobId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="loading-spinner"></div>
          <span className="ml-3 text-gray-600">Loading your profile...</span>
        </div>
      </div>
    );
  }

  const JobCard = ({ job, showApplyButton = true, appliedDate = null, status = null, showRemoveButton = false, onRemove = null }) => (
    <div className={`job-card animate-fade-in ${appliedDate ? 'job-card-applied' : showRemoveButton ? 'job-card-saved' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
            {job.title}
          </h3>
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="font-medium">{job.company}</span>
            <span className="text-gray-400">•</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{job.location}</span>
          </div>
          <p className="text-green-600 font-bold text-lg mb-3">{job.salary}</p>
          <span className={`company-badge ${
            job.job_type === 'Full-time' ? 'company-badge-fulltime' :
            job.job_type === 'Part-time' ? 'company-badge-parttime' :
            job.job_type === 'Contract' ? 'company-badge-contract' :
            'company-badge-internship'
          }`}>
            {job.job_type}
          </span>
        </div>
        
        {appliedDate && (
          <div className="text-right ml-4">
            <p className="text-sm text-gray-500 mb-2">Applied: {new Date(appliedDate).toLocaleDateString()}</p>
            <span className={`status-${status?.replace('_', '-')}`}>
              {status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        )}

        {showRemoveButton && onRemove && (
          <button
            onClick={() => onRemove(job.job_id)}
            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all duration-200 ml-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      <p className="text-gray-700 mb-6 leading-relaxed">{job.description}</p>
      
      <div className="mb-6">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Requirements:
        </h4>
        <div className="flex flex-wrap gap-2">
          {job.requirements?.split(',').map((req, index) => (
            <span key={index} className="requirement-tag">
              {req.trim()}
            </span>
          ))}
        </div>
      </div>

      {showApplyButton && (
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={() => applyForJob(job)}
            disabled={isJobApplied(job.id)}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              isJobApplied(job.id)
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'btn-primary hover-lift'
            }`}
          >
            {isJobApplied(job.id) ? (
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Already Applied
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Apply Now
              </span>
            )}
          </button>
          
          <button
            onClick={() => saveJob(job)}
            disabled={isJobSaved(job.id)}
            className={`px-6 py-3 rounded-xl border-2 transition-all duration-300 ${
              isJobSaved(job.id)
                ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                : 'border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white hover-lift'
            }`}
          >
            {isJobSaved(job.id) ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </button>
        </div>
      )}
      
      {!showApplyButton && !showRemoveButton && (
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={() => applyForJob(job)}
            disabled={isJobApplied(job.job_id)}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              isJobApplied(job.job_id)
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'btn-primary hover-lift'
            }`}
          >
            {isJobApplied(job.job_id) ? 'Already Applied' : 'Apply Now'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Profile Header */}
        <div className="dashboard-header hover-lift mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="profile-avatar hover:scale-110 transition-transform duration-300">
              {user.loginfullName?.charAt(0) || 'U'}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.loginfullName}</h1>
              <p className="text-gray-600 text-lg mb-1">{user.loginsignupemail}</p>
              <p className="text-gray-500">{user.logincity} • Age: {user.loginage}</p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="stats-card from-blue-500 to-purple-600">
                <div className="text-2xl font-bold text-white">{appliedJobs.length}</div>
                <div className="text-blue-100 text-sm">Applied</div>
              </div>
              <div className="stats-card from-green-500 to-emerald-600">
                <div className="text-2xl font-bold text-white">{savedJobs.length}</div>
                <div className="text-green-100 text-sm">Saved</div>
              </div>
              <div className="stats-card from-purple-500 to-pink-600">
                <div className="text-2xl font-bold text-white">{availableJobs.length}</div>
                <div className="text-purple-100 text-sm">Available</div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Tabs */}
        <div className="card mb-8">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab("profile")}
              className={`tab-button ${
                activeTab === "profile" ? "tab-button-active" : "tab-button-inactive"
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                </svg>
                <span>Available Jobs</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("applied")}
              className={`tab-button ${
                activeTab === "applied" ? "tab-button-active" : "tab-button-inactive"
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Applied Jobs ({appliedJobs.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`tab-button ${
                activeTab === "saved" ? "tab-button-active" : "tab-button-inactive"
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>Saved Jobs ({savedJobs.length})</span>
              </div>
            </button>
          </div>
        </div>

        {/* Enhanced Tab Content */}
        <div className="space-y-6">
          {activeTab === "profile" && (
            <div>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-section-title text-gray-800">Discover Your Next Opportunity</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{availableJobs.length} jobs found</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow"></div>
                  <span>Live updates</span>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-16">
                  <div className="loading-spinner mx-auto mb-4"></div>
                  <p className="text-gray-600">Finding perfect jobs for you...</p>
                </div>
              ) : availableJobs.length > 0 ? (
                <div className="grid gap-6">
                  {availableJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                  </svg>
                  <p className="text-gray-600 text-lg">No jobs available at the moment.</p>
                  <p className="text-gray-500">Check back later for new opportunities!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "applied" && (
            <div>
              <h2 className="text-section-title text-gray-800 mb-8">Your Application Journey</h2>
              {appliedJobs.length > 0 ? (
                <div className="grid gap-6">
                  {appliedJobs.map(application => (
                    <JobCard 
                      key={application.id}
                      job={application}
                      showApplyButton={false}
                      appliedDate={application.applied_date}
                      status={application.status}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 text-lg">No applications yet.</p>
                  <p className="text-gray-500 mb-6">Start applying to jobs to see them here!</p>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="btn-primary"
                  >
                    Browse Available Jobs
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "saved" && (
            <div>
              <h2 className="text-section-title text-gray-800 mb-8">Your Saved Opportunities</h2>
              {savedJobs.length > 0 ? (
                <div className="grid gap-6">
                  {savedJobs.map(savedJob => (
                    <JobCard 
                      key={savedJob.id}
                      job={savedJob}
                      showApplyButton={false}
                      showRemoveButton={true}
                      onRemove={removeSavedJob}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <p className="text-gray-600 text-lg">No saved jobs yet.</p>
                  <p className="text-gray-500 mb-6">Save interesting jobs to apply later!</p>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="btn-primary"
                  >
                    Find Jobs to Save
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;