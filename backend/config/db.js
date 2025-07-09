const mongoose = require("mongoose");

  const connectDB = ()=>{
    mongoose.connect(process.env.MONGO_URI,{
      useNewUrlParser:true,
      useUnifiedTopology:true,
    })
    .then(()=>{
      console.log("MongoDB connected");
    })
    .catch((err)=>{
      console.log("MongoDb connection error:",err);
      process.exit(1);
    })
  }

module.exports = connectDB;