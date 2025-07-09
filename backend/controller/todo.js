const User = require("../models/user");
const TODO = require("../models/todo");
const day = require("dayjs");
const mongoose = require("mongoose");

function isParticipantOrOwner(todo, userId) {
  const idStr = userId.toString();
  return (
    todo.createdBy.toString() === idStr ||
    todo.participants.some(p => (p?._id || p).toString() === idStr)
  );
}

// Create Todo
const createTodo = async (req, res) => {
  try {
    let { title, description, dueDate, participants = [] } = req.body;
    const userId = req.user?.id;

    if (!title || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    
    title = title.trim();

    
    const existTodo = await TODO.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
      createdBy: userId,
    });

    if (existTodo) {
      return res.status(400).json({ message: "A todo with this title already exists" });
    }

    const uniqueParticipants = [...new Set([...participants, userId])];

    const todo = new TODO({
      title,
      description,
      createdBy: userId,
      participants: uniqueParticipants,
      startDate: day().toDate(),
      ...(dueDate && { dueDate: day(dueDate).toDate() }),
      status: "todo"
    });

    const saved = await todo.save();
    res.status(201).json({ message: "Todo created successfully", todo: saved });
  } catch (err) {
    console.error("Error creating todo:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get All Todos 
const getAllTodo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const todos = await TODO.find({
      deleted: { $ne: true },
      $or: [{ createdBy: userId }, { participants: userId }],
    })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await TODO.countDocuments({
      deleted: { $ne: true },
      $or: [{ createdBy: userId }, { participants: userId }],
    });

    res.status(200).json({
      message: "Todos fetched",
      todos,
      page: +page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    console.error("Pagination error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Todo
const deleteTodo = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Todo ID" });
    }

    const todo = await TODO.findById(id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    if (todo.createdBy.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this todo" });
    }

    todo.deleted = true;
    await todo.save();

    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Todo
const updateTodo = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { title, description, dueDate, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Todo ID" });
    }

    const todo = await TODO.findById(id);
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    if (!isParticipantOrOwner(todo, userId)) {
      return res.status(403).json({ message: "Unauthorized to update this todo" });
    }

    const changes = [];

    if (title && title !== todo.title) {
      changes.push("title");
      todo.title = title;
    }

    if (description && description !== todo.description) {
      changes.push("description");
      todo.description = description;
    }

    if (dueDate && new Date(dueDate).toISOString() !== todo.dueDate?.toISOString()) {
      changes.push("dueDate");
      todo.dueDate = day(dueDate).toDate();
    }

    if (status && status !== todo.status) {
      const validStatuses = ["todo", "working", "finished"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      changes.push("status");
      todo.status = status;
    }

    if (changes.length > 0) {
      todo.history.push({
        updatedAt: new Date(),
        updatedBy: userId,
        change: `Updated: ${changes.join(", ")}`
      });
      todo.lastModifiedBy = userId;
    }

    const updated = await todo.save();
    res.status(200).json({ message: "Todo updated successfully", todo: updated });
  } catch (err) {
    console.error("Error updating todo:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get Single Todo
const getSingleTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Todo id" });
    }

    const todo = await TODO.findById(id).populate("participants", "email name");

    if (!todo || !isParticipantOrOwner(todo, userId)) {
      return res.status(403).json({ message: "Unauthorized or Todo not found" });
    }

    res.status(200).json({ message: "Todo found successfully", todo });
  } catch (err) {
    console.error("Error finding todo:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createTodo,
  getAllTodo,
  deleteTodo,
  updateTodo,
  getSingleTodo,
};
