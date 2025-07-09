const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: { 
      type: String,
       required: true 
      },
    description: {
       type: String, 
       required: true 
      },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true
     },
    participants: [{ 
      type: mongoose.Schema.Types.ObjectId,
       ref: "User"
       }],
    status: {
      type: String,
      enum: ["todo", "working", "finished"],
      default: "todo",
    },
    startDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    tags: [{ type: String }],

   
    deleted: { 
      type: Boolean,
       default: false 
      },

    lastModifiedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },

    history: [
      {
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        change: { type: String },
      },
    ],
  },
  { timestamps: true } 
);

module.exports = mongoose.model("TODO", todoSchema);
