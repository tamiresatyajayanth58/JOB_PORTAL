// server.js - Express.js Backend Server
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MySQL Database Connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'job_portal',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
};

let db;

async function initDatabase() {
  try {
    db = await mysql.createPool(dbConfig);
    console.log('✅ Connected to MySQL Database');
    
    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Create database tables
async function createTables() {
  try {
    // Users table (job seekers)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        loginfullName VARCHAR(255) NOT NULL,
        loginsignupemail VARCHAR(255) UNIQUE NOT NULL,
        loginsignuppassword VARCHAR(255) NOT NULL,
        logincity VARCHAR(255),
        loginage INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Recruiters table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS recruiters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        loginrecruiterfullName VARCHAR(255) NOT NULL,
        loginrecsignupemail VARCHAR(255) UNIQUE NOT NULL,
        loginrecsignuppassword VARCHAR(255) NOT NULL,
        loginreccity VARCHAR(255),
        logrecinage INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Jobs table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        recruiter_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255),
        salary VARCHAR(255),
        job_type ENUM('Full-time', 'Part-time', 'Contract', 'Internship') DEFAULT 'Full-time',
        description TEXT NOT NULL,
        requirements TEXT,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE
      )
    `);

    // Applications table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        job_id INT NOT NULL,
        status ENUM('applied', 'under_review', 'accepted', 'rejected') DEFAULT 'applied',
        applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        UNIQUE KEY unique_application (user_id, job_id)
      )
    `);

    // Saved jobs table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        job_id INT NOT NULL,
        saved_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        UNIQUE KEY unique_saved_job (user_id, job_id)
      )
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ===== AUTH ROUTES =====

// User Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { loginfullName, loginsignupemail, loginsignuppassword, logincity, loginage } = req.body;

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE loginsignupemail = ?',
      [loginsignupemail]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(loginsignuppassword, 10);

    // Insert new user
    const [result] = await db.execute(
      'INSERT INTO users (loginfullName, loginsignupemail, loginsignuppassword, logincity, loginage) VALUES (?, ?, ?, ?, ?)',
      [loginfullName, loginsignupemail, hashedPassword, logincity, loginage]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: result.insertId
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { loginEmail, loginPassword } = req.body;

    // Find user
    const [users] = await db.execute(
      'SELECT * FROM users WHERE loginsignupemail = ?',
      [loginEmail]
    );

    if (users.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(loginPassword, user.loginsignuppassword);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: 'user', email: user.loginsignupemail },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from user object
    delete user.loginsignuppassword;

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        loginfullName: user.loginfullName,
        loginsignupemail: user.loginsignupemail,
        logincity: user.logincity,
        loginage: user.loginage
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Recruiter Signup
app.post('/api/auth/recruiter/signup', async (req, res) => {
  try {
    const { loginrecruiterfullName, loginrecsignupemail, loginrecsignuppassword, loginreccity, logrecinage } = req.body;

    // Check if recruiter already exists
    const [existingRecruiters] = await db.execute(
      'SELECT id FROM recruiters WHERE loginrecsignupemail = ?',
      [loginrecsignupemail]
    );

    if (existingRecruiters.length > 0) {
      return res.status(400).json({ success: false, message: 'Recruiter already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(loginrecsignuppassword, 10);

    // Insert new recruiter
    const [result] = await db.execute(
      'INSERT INTO recruiters (loginrecruiterfullName, loginrecsignupemail, loginrecsignuppassword, loginreccity, logrecinage) VALUES (?, ?, ?, ?, ?)',
      [loginrecruiterfullName, loginrecsignupemail, hashedPassword, loginreccity, logrecinage]
    );

    res.status(201).json({
      success: true,
      message: 'Recruiter registered successfully',
      recruiterId: result.insertId
    });
  } catch (error) {
    console.error('Recruiter signup error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Recruiter Login
app.post('/api/auth/recruiter/login', async (req, res) => {
  try {
    const { recruiterEmail, recruiterPassword } = req.body;

    // Find recruiter
    const [recruiters] = await db.execute(
      'SELECT * FROM recruiters WHERE loginrecsignupemail = ?',
      [recruiterEmail]
    );

    if (recruiters.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    const recruiter = recruiters[0];

    // Check password
    const isValidPassword = await bcrypt.compare(recruiterPassword, recruiter.loginrecsignuppassword);
    if (!isValidPassword) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: recruiter.id, userType: 'recruiter', email: recruiter.loginrecsignupemail },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Remove password from recruiter object
    delete recruiter.loginrecsignuppassword;

    res.json({
      success: true,
      token,
      user: {
        id: recruiter.id,
        loginrecruiterfullName: recruiter.loginrecruiterfullName,
        loginrecsignupemail: recruiter.loginrecsignupemail,
        loginreccity: recruiter.loginreccity,
        logrecinage: recruiter.logrecinage
      }
    });
  } catch (error) {
    console.error('Recruiter login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ===== JOB ROUTES =====

// Get all jobs (for job seekers)
app.get('/api/jobs', authenticateToken, async (req, res) => {
  try {
    const [jobs] = await db.execute(`
      SELECT j.*, r.loginrecruiterfullName as recruiter_name 
      FROM jobs j 
      JOIN recruiters r ON j.recruiter_id = r.id 
      WHERE j.status = 'active' 
      ORDER BY j.created_at DESC
    `);

    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get recruiter's jobs
app.get('/api/jobs/recruiter', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'recruiter') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [jobs] = await db.execute(
      'SELECT * FROM jobs WHERE recruiter_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create new job (recruiter only)
app.post('/api/jobs', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'recruiter') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { title, company, location, salary, job_type, description, requirements } = req.body;

    const [result] = await db.execute(
      'INSERT INTO jobs (recruiter_id, title, company, location, salary, job_type, description, requirements) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.userId, title, company, location, salary, job_type, description, requirements]
    );

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      jobId: result.insertId
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete job (recruiter only)
app.delete('/api/jobs/:jobId', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'recruiter') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { jobId } = req.params;

    // Check if job belongs to the recruiter
    const [jobs] = await db.execute(
      'SELECT id FROM jobs WHERE id = ? AND recruiter_id = ?',
      [jobId, req.user.userId]
    );

    if (jobs.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found or access denied' });
    }

    await db.execute('DELETE FROM jobs WHERE id = ?', [jobId]);

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ===== APPLICATION ROUTES =====

// Apply for job (user only)
app.post('/api/applications', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'user') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { jobId } = req.body;

    // Check if already applied
    const [existingApplications] = await db.execute(
      'SELECT id FROM applications WHERE user_id = ? AND job_id = ?',
      [req.user.userId, jobId]
    );

    if (existingApplications.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    // Insert application
    const [result] = await db.execute(
      'INSERT INTO applications (user_id, job_id) VALUES (?, ?)',
      [req.user.userId, jobId]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: result.insertId
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user's applications
app.get('/api/applications/user', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'user') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [applications] = await db.execute(`
      SELECT a.*, j.title, j.company, j.location, j.salary, j.job_type, j.description, j.requirements
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.user_id = ?
      ORDER BY a.applied_date DESC
    `, [req.user.userId]);

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get applications for recruiter's jobs
app.get('/api/applications/recruiter', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'recruiter') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [applications] = await db.execute(`
      SELECT a.*, j.title as job_title, j.company, j.location, j.description as job_description,
             u.loginfullName as user_name, u.loginsignupemail as user_email
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON a.user_id = u.id
      WHERE j.recruiter_id = ?
      ORDER BY a.applied_date DESC
    `, [req.user.userId]);

    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching recruiter applications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update application status (recruiter only)
app.put('/api/applications/:applicationId/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'recruiter') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { applicationId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['applied', 'under_review', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Check if application belongs to recruiter's job
    const [applications] = await db.execute(`
      SELECT a.id 
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ? AND j.recruiter_id = ?
    `, [applicationId, req.user.userId]);

    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found or access denied' });
    }

    // Update status
    await db.execute(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, applicationId]
    );

    res.json({ success: true, message: 'Application status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ===== SAVED JOBS ROUTES =====

// Save job (user only)
app.post('/api/saved-jobs', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'user') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { jobId } = req.body;

    // Check if already saved
    const [existingSavedJobs] = await db.execute(
      'SELECT id FROM saved_jobs WHERE user_id = ? AND job_id = ?',
      [req.user.userId, jobId]
    );

    if (existingSavedJobs.length > 0) {
      return res.status(400).json({ success: false, message: 'Job already saved' });
    }

    // Insert saved job
    const [result] = await db.execute(
      'INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)',
      [req.user.userId, jobId]
    );

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      savedJobId: result.insertId
    });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get saved jobs (user only)
app.get('/api/saved-jobs', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'user') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const [savedJobs] = await db.execute(`
      SELECT s.*, j.title, j.company, j.location, j.salary, j.job_type, j.description, j.requirements
      FROM saved_jobs s
      JOIN jobs j ON s.job_id = j.id
      WHERE s.user_id = ?
      ORDER BY s.saved_date DESC
    `, [req.user.userId]);

    res.json({ success: true, savedJobs });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Remove saved job (user only)
app.delete('/api/saved-jobs/:jobId', authenticateToken, async (req, res) => {
  try {
    if (req.user.userType !== 'user') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { jobId } = req.params;

    await db.execute(
      'DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?',
      [req.user.userId, jobId]
    );

    res.json({ success: true, message: 'Saved job removed successfully' });
  } catch (error) {
    console.error('Error removing saved job:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;