const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const tasks = [
  { id: 1, title: "Complete project proposal", priority: "High", completed: false },
];

// GET request to fetch tasks
app.get("/tasks", (req, res) => {
  res.json(tasks);
});

// POST request to add a new task
app.post("/tasks", (req, res) => {
  const newTask = { id: tasks.length + 1, ...req.body };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));