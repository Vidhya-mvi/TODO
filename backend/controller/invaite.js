const Invite = require("../models/invaite");
const TODO = require("../models/todo");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const dayjs = require("dayjs");

// Send invite
const sendInvite = async (req, res) => {
  try {
    const { email, todoId } = req.body;
    const invitedBy = req.user?.id;

    if (!email || !todoId) {
      return res.status(400).json({ message: "Email and Todo ID are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const todo = await TODO.findById(todoId);

    if (!todo) return res.status(404).json({ message: "Todo not found" });
    if (todo.createdBy.toString() !== invitedBy) {
      return res.status(403).json({ message: "Only the owner can send invites" });
    }

    const existingInvite = await Invite.findOne({
      email: normalizedEmail,
      todo: todoId,
      status: "pending",
    });

    if (existingInvite && existingInvite.expiresAt > new Date()) {
      return res.status(400).json({ message: "User already invited" });
    }

    const token = jwt.sign({ email: normalizedEmail, todoId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const invite = new Invite({
      email: normalizedEmail,
      todo: todoId,
      token,
      invitedBy,
      status: "pending",
      expiresAt: dayjs().add(7, "day").toDate(),
    });

    await invite.save();

    const frontendUrl = process.env.FRONTEND_URL.replace(/\/+$/, "");
    const link = `${frontendUrl}/invite/accept?token=${token}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    await transporter.sendMail({
      from: `"Todo App" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "You've been invited to a Todo",
      html: `<p>You’ve been invited to collaborate on a Todo.</p>
             <p><a href="${link}">Click here to accept the invite</a></p>
             <p>This invitation expires in 7 days.</p>`,
    });

    res.status(200).json({ message: "Invitation sent" });
  } catch (err) {
    console.error("Send Invite Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept invite
const acceptInvite = async (req, res) => {
  try {
    const { token } = req.query;
    const user = req.user;

    if (!token) return res.status(400).json({ message: "Token is required" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const { email, todoId } = decoded;
    const invite = await Invite.findOne({ email, todo: todoId, token });

    if (!invite || invite.status !== "pending") {
      return res.status(400).json({ message: "Invalid or expired invitation" });
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      invite.status = "expired";
      await invite.save();
      return res.status(400).json({ message: "Invitation expired" });
    }

    const todo = await TODO.findById(todoId);
    if (!todo) return res.status(404).json({ message: "Todo not found" });

    const alreadyParticipant = todo.participants.some(
      (id) => id.toString() === user.id
    );

    if (!alreadyParticipant) {
      todo.participants.push(user.id);
      await todo.save();
    }

    invite.status = "accepted";
    invite.acceptedAt = new Date();
    await invite.save();

    res.status(200).json({
      message: "Invitation accepted",
      todoId: todo._id,
      title: todo.title,
      participants: todo.participants,
    });
  } catch (err) {
    console.error("Accept Invite Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Reject invite
const rejectInvite = async (req, res) => {
  try {
    const { token } = req.query;

    const invite = await Invite.findOne({ token });
    if (!invite || invite.status !== "pending") {
      return res.status(400).json({ message: "Invalid or expired invitation" });
    }

    invite.status = "rejected";
    await invite.save();

    res.status(200).json({ message: "Invitation rejected" });
  } catch (err) {
    console.error("Reject Invite Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get pending invites 
const getPendingInvite = async (req, res) => {
  try {
    const userEmail = req.user?.email.toLowerCase();
    const invites = await Invite.find({
      email: userEmail,
      status: "pending",
      expiresAt: { $gte: new Date() },
    }).populate("todo");


    const result = invites.map(invite => ({
      token: invite.token,
      email: invite.email,
      todo: {
        title: invite.todo?.title || "Untitled",
        id: invite.todo?._id
      }
    }));

    res.status(200).json({ invites: result });
  } catch (err) {
    console.error("Get Pending Invites Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getInviteStatus = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const invite = await Invite.findOne({ token }).populate("todo");

    if (!invite) {
      return res.status(404).json({ message: "Invite not found" });
    }

    if (invite.status !== "pending") {
      return res.status(400).json({ message: `Invite already ${invite.status}` });
    }

    if (invite.expiresAt < new Date()) {
      invite.status = "expired";
      await invite.save();
      return res.status(400).json({ message: "Invite expired" });
    }

    return res.status(200).json({
      email: invite.email,
      todo: invite.todo?.title || "Untitled",
      invitedBy: invite.invitedBy,
      expiresAt: invite.expiresAt
    });
  } catch (error) {
    console.error("Error fetching invite status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  sendInvite,
  acceptInvite,
  rejectInvite,
  getPendingInvite,
  getInviteStatus
};
