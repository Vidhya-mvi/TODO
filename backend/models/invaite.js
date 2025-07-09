const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  todo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TODO",
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "expired"],
    default: "pending"
  },
  acceptedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Invite = mongoose.model("Invite", inviteSchema);

module.exports = Invite;
