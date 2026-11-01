const express = require("express");
const pool = require("./db");
const app = express();
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

app.listen(3000, () => console.log("Listening on port 3000"));
