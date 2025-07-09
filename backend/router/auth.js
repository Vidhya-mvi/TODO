const express = require("express");
const router = express.Router();
const {register,login,logout,getCurrentUser}=require("../controller/auth");
const authMiddleware =require("../middleware/auth")


router.post("/register",register);
router.post("/login",login);
router.post("/logout",logout);
router.get("/me",authMiddleware,getCurrentUser)

module.exports=router;