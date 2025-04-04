const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Task = require("./models/Task"); // Import Task model

const app = express();
const PORT = 5000;
//WhQfQ4bE1tMccNc1


const allowedOrigins = ["https://task-manager-frontend-2yzezb2gh-oversight1s-projects.vercel.app"];
// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

//Executing a trigger for the AI script 
const { exec } = require("child_process");

exec("python3 ./ai/ai_task_priority.py", (error, stdout, stderr) => {
    if (error) console.error(`Error: ${error.message}`);
    if (stderr) console.error(`Stderr: ${stderr}`);
    console.log(`AI Output: ${stdout}`);
});

// ✅ Connect to MongoDB
mongoose.connect("mongodb+srv://Hallshooting:WhQfQ4bE1tMccNc1@oversight.hiwp0.mongodb.net/?retryWrites=true&w=majority&appName=Oversight", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Test route to confirm server is running
app.get("/", (req, res) => {
  res.send("✅ Server is running!");
});

// ✅ GET: Fetch all tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find().sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// ✅ POST: Add a new task
app.post("/tasks", async (req, res) => {
  try {
    const { title, priority, dueDate } = req.body;
    if (!title || !priority || !dueDate) {
      return res.status(400).json({ message: "Title and priority and due date are required" });
    }

    const newTask = new Task({ title, priority, dueDate });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error adding task" });
  }
});

// ✅ PATCH: Mark task as completed
app.patch("/tasks/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.completed = !task.completed;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
});

// ✅ DELETE: Remove a task
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
});


// Add Task & Trigger AI Classification
app.post("/add-task", async (req, res) => {
    const { title } = req.body;
    const newTask = new Task({ title });

    await newTask.save();

    // Run AI model to classify tasks
    exec("python ai_task_priority.py", (error, stdout, stderr) => {
        if (error) console.error(`Error: ${error.message}`);
        if (stderr) console.error(`Stderr: ${stderr}`);
        console.log(`AI Output: ${stdout}`);
    });

    res.json({ message: "Task added and AI classification triggered!" });
});


//Fetch or add AI suggestions for the user 
app.get("/ai-suggestion", async (req, res) => {
    const summary = await mongoose.connection.db.collection("suggestions").findOne({ type: "ai-summary" });
    res.json({ suggestion: summary?.summary || "No suggestion available yet." });
});

// ✅ START SERVER (This was missing!)
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
