const express = require("express");
const router = express.Router();
const {
  sendInvite,
  acceptInvite,
  rejectInvite,
  getPendingInvite,
  getInviteStatus
} = require("../controller/invaite");
const authMiddleware = require("../middleware/auth");

router.post("/send", authMiddleware, sendInvite);
router.post("/accept", authMiddleware, acceptInvite);
router.post("/reject", authMiddleware, rejectInvite);
router.get("/pending", authMiddleware, getPendingInvite);
router.get("/",authMiddleware,getInviteStatus)


module.exports = router;
