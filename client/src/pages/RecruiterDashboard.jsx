// RecruiterDashboard.jsx - Recruiter Dashboard with backend integration
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const [recruiter, setRecruiter] = useState(null);
  const [activeTab, setActiveTab] = useState("applications");
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [showAddJobForm, setShowAddJobForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state for adding new jobs
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    job_type: "Full-time",
    description: "",
    requirements: ""
  });

  useEffect(() => {
    // Check if recruiter is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const userType = localStorage.getItem("userType");
    
    if (!token || !userData || userType !== "recruiter") {
      alert("Please login as a recruiter to access this dashboard");
      navigate("/recruiterlogin");
      return;
    }

    const parsedRecruiter = JSON.parse(userData);
    setRecruiter(parsedRecruiter);

    // Fetch data from backend
    fetchApplications();
    fetchRecruiterJobs();
  }, [navigate]);

  const fetchApplications = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/applications/recruiter", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruiterJobs = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/jobs/recruiter", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error fetching recruiter jobs:", error);
    }
  };

  const handleInputChange = (e) => {
    setNewJob({
      ...newJob,
      [e.target.name]: e.target.value
    });
  };

  const handleAddJob = async (e) => {
    e.preventDefault();
    
    if (!newJob.title || !newJob.company || !newJob.description) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newJob),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert("Job posted successfully!");
        setNewJob({
          title: "",
          company: "",
          location: "",
          salary: "",
          job_type: "Full-time",
          description: "",
          requirements: ""
        });
        setShowAddJobForm(false);
        fetchRecruiterJobs(); // Refresh jobs list
      } else {
        alert(data.message || "Failed to post job");
      }
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Network error. Please try again.");
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Application status updated to ${newStatus}`);
        fetchApplications(); // Refresh applications
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Network error. Please try again.");
    }
  };

  const deleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job posting?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          alert("Job deleted successfully!");
          fetchRecruiterJobs(); // Refresh jobs list
        } else {
          alert("Failed to delete job");
        }
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Network error. Please try again.");
      }
    }
  };

  if (!recruiter) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Recruiter Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {recruiter.loginrecruiterfullName?.charAt(0) || 'R'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {recruiter.loginrecruiterfullName || 'Recruiter'}
                </h1>
                <p className="text-gray-600">{recruiter.loginrecsignupemail}</p>
                <p className="text-gray-600">{recruiter.loginreccity} • Age: {recruiter.logrecinage}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Jobs Posted</p>
              <p className="text-2xl font-bold text-green-600">{jobs.length}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("applications")}
              className={`px-6 py-4 font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "applications"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab("jobs")}
              className={`px-6 py-4 font-medium border-b-2 transition-colors duration-200 ${
                activeTab === "jobs"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-600 hover:text-gray-800"
              }`}
            >
              My Job Postings ({jobs.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "applications" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Job Applications</h2>
              </div>
              
              {loading ? (
                <div className="text-center py-8">Loading applications...</div>
              ) : applications.length > 0 ? (
                <div className="grid gap-6">
                  {applications.map((application) => (
                    <div key={application.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">
                            Application for {application.job_title}
                          </h3>
                          <p className="text-gray-600">{application.company} • {application.location}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Applicant: {application.user_name} ({application.user_email})
                          </p>
                          <p className="text-sm text-gray-500">
                            Applied: {new Date(application.applied_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            application.status === 'applied' ? 'bg-yellow-100 text-yellow-800' :
                            application.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                            application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {application.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-700">{application.job_description}</p>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => updateApplicationStatus(application.id, "under_review")}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          Mark Under Review
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application.id, "accepted")}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateApplicationStatus(application.id, "rejected")}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No applications received yet.</p>
                  <p className="text-gray-500">Applications will appear here when candidates apply to your job postings.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "jobs" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">My Job Postings</h2>
                <button
                  onClick={() => setShowAddJobForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  + Add New Job
                </button>
              </div>

              {/* Add Job Form Modal */}
              {showAddJobForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4">Add New Job Posting</h3>
                    <form onSubmit={handleAddJob} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Job Title *
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={newJob.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company *
                          </label>
                          <input
                            type="text"
                            name="company"
                            value={newJob.company}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            name="location"
                            value={newJob.location}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Salary Range
                          </label>
                          <input
                            type="text"
                            name="salary"
                            value={newJob.salary}
                            onChange={handleInputChange}
                            placeholder="e.g., $60,000 - $80,000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Type
                        </label>
                        <select
                          name="job_type"
                          value={newJob.job_type}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Description *
                        </label>
                        <textarea
                          name="description"
                          value={newJob.description}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Requirements (comma-separated)
                        </label>
                        <textarea
                          name="requirements"
                          value={newJob.requirements}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="e.g., React, JavaScript, 3+ years experience"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Post Job
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddJobForm(false)}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Job Listings */}
              {jobs.length > 0 ? (
                <div className="grid gap-6">
                  {jobs.map(job => (
                    <div key={job.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
                          <p className="text-gray-600">{job.company} • {job.location}</p>
                          <p className="text-green-600 font-medium">{job.salary}</p>
                          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm mt-2">
                            {job.job_type}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Posted: {new Date(job.created_at).toLocaleDateString()}</p>
                          <button
                            onClick={() => deleteJob(job.id)}
                            className="text-red-600 hover:text-red-800 text-sm mt-2 transition-colors duration-200"
                          >
                            Delete Job
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{job.description}</p>
                      
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Requirements:</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements?.split(',').map((req, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                              {req.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No job postings yet.</p>
                  <p className="text-gray-500">Click "Add New Job" to create your first job posting.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;