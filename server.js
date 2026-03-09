const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ------------------ MYSQL CONNECTION ------------------
const db = mysql.createConnection({
  host: "localhost",
  user: "", //Your username here
  password: "", //Your password here
  database: "Railpass"
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
    return;
  }
  console.log("✅ MySQL Connected...");
});

// ------------------ REGISTER ------------------
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ error: "All fields required" });

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO Users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed],
      (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "User already exists" });
          }
          console.error("DB Error (Register):", err);
          return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "User registered successfully!" });
      }
    );
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------ LOGIN ------------------
app.post("/login", (req, res) => {
  const { username, password, role } = req.body;

  if (role === "admin") {
    if (username === "admin@vcet" && password === "admin@vcet123") {
      return res.json({ message: "Admin login successful!" });
    } else {
      return res.status(400).json({ error: "Invalid admin credentials" });
    }
  }

  db.query("SELECT * FROM Users WHERE username = ?", [username], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0) return res.status(400).json({ error: "User not found" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    res.json({ message: "Login successful!" });
  });
});

// ------------------ PROFILE ROUTES ------------------
app.get("/profile/:username", (req, res) => {
  const { username } = req.params;

  db.query("SELECT * FROM Users WHERE username = ?", [username], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length === 0) return res.json(null);
    res.json(result[0]);
  });
});

app.post("/profile", (req, res) => {
  const { username, firstName, fatherName, lastName, nearestStation } = req.body;

  db.query("SELECT * FROM Users WHERE username = ?", [username], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (result.length === 0) return res.status(400).json({ error: "User not found" });

    db.query(
      "UPDATE Users SET firstName=?, fatherName=?, lastName=?, nearestStation=? WHERE username=?",
      [firstName, fatherName, lastName, nearestStation, username],
      (err2) => {
        if (err2) return res.status(500).json({ error: "DB update error" });
        res.json({ message: "Profile updated successfully!" });
      }
    );
  });
});

// ------------------ APPLICATION ROUTES ------------------
app.post("/application", (req, res) => {
  const { username, nearestStation, preferredClass, duration } = req.body;

  db.query(
    "SELECT * FROM Applications WHERE username=? AND status='Pending'",
    [username],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (result.length > 0) return res.status(400).json({ error: "You already have a pending application" });

      db.query(
        "INSERT INTO Applications (username, nearestStation, preferredClass, duration, status) VALUES (?, ?, ?, ?, 'Pending')",
        [username, nearestStation, preferredClass, duration],
        (err2) => {
          if (err2) return res.status(500).json({ error: "DB insert error" });
          res.json({ message: "Application submitted successfully!" });
        }
      );
    }
  );
});

app.get("/application/:username", (req, res) => {
  const { username } = req.params;

  db.query(
    "SELECT * FROM Applications WHERE username=? ORDER BY created_at DESC",
    [username],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(result);
    }
  );
});

// ------------------ ADMIN ROUTES ------------------
app.get("/applications", (req, res) => {
  db.query("SELECT * FROM Applications ORDER BY created_at DESC", (err, result) => {
    if (err) return res.status(500).json({ error: "DB fetch error" });
    res.json(result);
  });
});

app.put("/application/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query(
    "UPDATE Applications SET status=? WHERE id=?",
    [status, id],
    (err) => {
      if (err) return res.status(500).json({ error: "DB update error" });
      res.json({ message: `Application ${status.toLowerCase()} successfully!` }); // ✅ FIXED template literal
    }
  );
});

// ------------------ SERVER ------------------
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
