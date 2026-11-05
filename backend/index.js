const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Auth middleware ----------
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ---------- Auth routes ----------
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, passwordHash]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log(error);
    if (error.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ---------- Task routes (each user sees only their own tasks) ----------

// Read all
app.get("/tasks", authenticate, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM tasks WHERE user_id = $1 ORDER BY id",
    [req.userId]
  );
  res.json(result.rows);
});

// Read one
app.get("/tasks/:id", authenticate, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
    [req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
  res.json(result.rows[0]);
});

// Create
app.post("/tasks", authenticate, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  const result = await pool.query(
    "INSERT INTO tasks (title, user_id) VALUES ($1, $2) RETURNING *",
    [title, req.userId]
  );
  res.status(201).json(result.rows[0]);
});

// Update
app.put("/tasks/:id", authenticate, async (req, res) => {
  const { title, done } = req.body;
  const result = await pool.query(
    "UPDATE tasks SET title = COALESCE($1, title), done = COALESCE($2, done) WHERE id = $3 AND user_id = $4 RETURNING *",
    [title, done, req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
  res.json(result.rows[0]);
});

// Delete
app.delete("/tasks/:id", authenticate, async (req, res) => {
  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id",
    [req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));