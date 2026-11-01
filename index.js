const express = require("express");
const app = express();
app.use(express.json());

let tasks = [];
let nextId = 1;

// Read all
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// Create
app.post("/tasks", (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: "Title is required" });
  const task = { id: nextId++, title, done: false };
  tasks.push(task);
  res.status(201).json(task);
});
// Read one
app.get("/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json(task);
});

// Update
app.put("/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  const { title, done } = req.body;
  if (title !== undefined) task.title = title;
  if (done !== undefined) task.done = done;
  res.json(task);
});

// Delete
app.delete("/tasks/:id", (req, res) => {
  const index = tasks.findIndex((t) => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: "Task not found" });
  tasks.splice(index, 1);
  res.status(204).send();
})
app.listen(3000, () => console.log("Listening on port 3000"));