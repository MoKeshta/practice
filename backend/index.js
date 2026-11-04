const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcryptjs");
const app = express();
app.use(cors());
app.use(express.json());

// Read all
app.get("/tasks", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks ORDER BY id");
  res.json(result.rows);
});

// Read one
app.get("/tasks/:id", async (req, res) => {
  const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
  res.json(result.rows[0]);
});

// Create
app.post("/tasks", async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  const result = await pool.query(
    "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
    [title]
  );
  res.status(201).json(result.rows[0]);
});

// Update
app.put("/tasks/:id", async (req, res) => {
  const { title, done } = req.body;
  const result = await pool.query(
    "UPDATE tasks SET title = COALESCE($1, title), done = COALESCE($2, done) WHERE id = $3 RETURNING *",
    [title, done, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
  res.json(result.rows[0]);
});

// Delete
app.delete("/tasks/:id", async (req, res) => {
  const result = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING id", [req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
  res.status(204).send();
});
app.post("/register", async (req, res) => {
  const {email , password} = req.body;

if (!email || !password) {
  return res.status(400).json({error : "Must Fill email and Password"}); }  
  const passwordHASH = await bcrypt.hash(password, 10);
  
 try {
  const result = await pool.query(
    "INSERT INTO users (email , password_Hash) VALUES ($1 , $2) RETURNING id,email",
    [email, passwordHASH]
  );
   res.status(201).json(result.rows[0]); 
 }
 
 catch (error) {
  console.log(error);
  if (error.code === "23505") {
    return res.status(409).json({ error: "Email already exists" });
  }
  res.status(500).json({ error: "Something went wrong" });
}
});
app.post("/login", async (req, res) => {
  // 1. get the data
  const { email, password } = req.body;

  // 2. check it
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // 3. look up the user by email
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    // 4. no user found
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // 5. compare the typed password with the stored hash
    const match = await bcrypt.compare(password, user.password_hash);

    // 6. wrong password: same message as step 4
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 7. correct: create a token that holds the user's id
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));