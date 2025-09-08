const express = require("express");
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Regular User Login
router.post("/login", (req, res) => {
  const { loginEmail, loginPassword } = req.body;

  if (!loginEmail || !loginPassword) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [loginEmail],
    async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      const user = results[0];

      try {
        const isValidPassword = await bcrypt.compare(
          loginPassword,
          user.password
        );

        if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid password" });
        }

        // Create JWT token
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            type: "user",
          },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );

        res.json({
          success: true,
          message: "Login successful",
          token,
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            city: user.city,
            age: user.age,
          },
        });
      } catch (error) {
        console.error("Password comparison error:", error);
        return res.status(500).json({ message: "Server error" });
      }
    }
  );
});

// Regular User Registration
router.post("/signup", async (req, res) => {
  const {
    loginfullName,
    loginsignupemail,
    loginsignuppassword,
    logincity,
    loginage,
  } = req.body;

  if (!loginfullName || !loginsignupemail || !loginsignuppassword) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  try {
    // Check if user already exists
    db.query(
      "SELECT * FROM users WHERE email = ?",
      [loginsignupemail],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Server error" });
        }

        if (results.length > 0) {
          return res
            .status(400)
            .json({ message: "User already exists with this email" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(loginsignuppassword, 12);

        // Insert new user
        db.query(
          "INSERT INTO users (fullName, email, password, city, age) VALUES (?, ?, ?, ?, ?)",
          [
            loginfullName,
            loginsignupemail,
            hashedPassword,
            logincity,
            parseInt(loginage),
          ],
          (err, result) => {
            if (err) {
              console.error("Database error:", err);
              return res.status(500).json({ message: "Error creating user" });
            }

            res.status(201).json({
              success: true,
              message: "User registered successfully",
              userId: result.insertId,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Recruiter Login
router.post("/recruiter-login", (req, res) => {
  const { recruiterEmail, recruiterPassword } = req.body;

  if (!recruiterEmail || !recruiterPassword) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  db.query(
    "SELECT * FROM recruiters WHERE email = ?",
    [recruiterEmail],
    async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: "Recruiter not found" });
      }

      const recruiter = results[0];

      try {
        const isValidPassword = await bcrypt.compare(
          recruiterPassword,
          recruiter.password
        );

        if (!isValidPassword) {
          return res.status(401).json({ message: "Invalid password" });
        }

        // Create JWT token
        const token = jwt.sign(
          {
            id: recruiter.id,
            email: recruiter.email,
            type: "recruiter",
          },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );

        res.json({
          success: true,
          message: "Recruiter login successful",
          token,
          recruiter: {
            id: recruiter.id,
            fullName: recruiter.fullName,
            email: recruiter.email,
            city: recruiter.city,
            age: recruiter.age,
          },
        });
      } catch (error) {
        console.error("Password comparison error:", error);
        return res.status(500).json({ message: "Server error" });
      }
    }
  );
});

// Recruiter Registration
router.post("/recruiter-signup", async (req, res) => {
  const {
    loginrecruiterfullName,
    loginrecsignupemail,
    loginrecsignuppassword,
    loginreccity,
    logrecinage,
  } = req.body;

  if (
    !loginrecruiterfullName ||
    !loginrecsignupemail ||
    !loginrecsignuppassword
  ) {
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  }

  try {
    // Check if recruiter already exists
    db.query(
      "SELECT * FROM recruiters WHERE email = ?",
      [loginrecsignupemail],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Server error" });
        }

        if (results.length > 0) {
          return res
            .status(400)
            .json({ message: "Recruiter already exists with this email" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(loginrecsignuppassword, 12);

        // Insert new recruiter
        db.query(
          "INSERT INTO recruiters (fullName, email, password, city, age) VALUES (?, ?, ?, ?, ?)",
          [
            loginrecruiterfullName,
            loginrecsignupemail,
            hashedPassword,
            loginreccity,
            parseInt(logrecinage),
          ],
          (err, result) => {
            if (err) {
              console.error("Database error:", err);
              return res
                .status(500)
                .json({ message: "Error creating recruiter" });
            }

            res.status(201).json({
              success: true,
              message: "Recruiter registered successfully",
              recruiterId: result.insertId,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
