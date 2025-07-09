const express = require("express");
const dotenv = require("dotenv");
const cookieparser = require("cookie-parser");
const connectDB = require("./config/db");
const authRouter = require("./router/auth");
const todoRouter = require("./router/todo");
const invaiteRouter=require("./router/invaite")
const cors = require("cors");
dotenv.config();
const app = express();
PORT=8000||process.env.PORT

app.use(express.json());
app.use(cookieparser());


app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true               
}));


connectDB();

app.use("/api/auth",authRouter);
app.use("/api/todo",todoRouter);
app.use("/api/invite",invaiteRouter);

app.get("/",(req,res)=>res.send("API running ...."));

app.listen(PORT,()=>{
  console.log(`Server running on the port ${PORT}`);
})
