const mysql = require('mysql2');
require('dotenv').config();

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'jobportal'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    throw err;
  }
  console.log('Connected to MySQL Database');
});

// Create tables if they don't exist
const createTables = () => {
  // Users table for regular users
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fullName VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      city VARCHAR(100),
      age INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Recruiters table for recruiters
  const createRecruitersTable = `
    CREATE TABLE IF NOT EXISTS recruiters (
      id INT AUTO_INCREMENT PRIMARY KEY,
      fullName VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      city VARCHAR(100),
      age INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createUsersTable, (err) => {
    if (err) console.error('Error creating users table:', err);
    else console.log('Users table created or already exists');
  });

  db.query(createRecruitersTable, (err) => {
    if (err) console.error('Error creating recruiters table:', err);
    else console.log('Recruiters table created or already exists');
  });
};

// Initialize tables
createTables();

module.exports = db;