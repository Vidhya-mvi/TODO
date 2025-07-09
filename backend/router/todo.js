const express = require("express");
const router = express.Router();
const { createTodo,
  getAllTodo,
  deleteTodo,
  updateTodo,
  getSingleTodo}= require("../controller/todo");
  const verifyToken = require("../middleware/auth");

  router.get("/", verifyToken, getAllTodo);
router.get("/:id", verifyToken, getSingleTodo);
router.post("/create", verifyToken, createTodo);
router.put("/:id", verifyToken, updateTodo);
router.delete("/:id", verifyToken, deleteTodo);



 module.exports = router;