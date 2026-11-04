const express = require("express");
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
  // 1. get email and password from req.body
  const {email , password} = req.body;

  // 2. if either one is missing, return status 400 with an error message
if (!email || !password) {
  return res.status(400).json({error : "Must Fill email and Password"}); }
  // 3. hash the password
  const passwordHASH = await bcrypt.hash(password, 10);
  // 4. inside a try block: insert the email and the hash into users,
  //    then return status 201 with only the id and email
 try {
  const result = await pool.query(
    "INSERT INTO users (email , password_Hash) VALUES ($1 , $2) RETURNING id,email",
    [email, passwordHASH]
  );
   res.status(201).json(result.rows[0]); 
 }
  // 5. in the catch block: if error.code === "23505", return status 409
  //    (email already exists), otherwise return status 500
 catch (error) {
  console.log(error);
  if (error.code === "23505") {
    return res.status(409).json({ error: "Email already exists" });
  }
  res.status(500).json({ error: "Something went wrong" });
}
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));