const mongoose = require("mongoose");

// Define the Task Schema
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priority: { type: String, enum: ["High", "Medium", "Low"], required: true },
  completed: { type: Boolean, default: false }
});

// Create the Task model
const Task = mongoose.model("Task", TaskSchema);

module.exports = Task; // Export the model