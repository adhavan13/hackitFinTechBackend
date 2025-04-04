const mongoose = require("mongoose");

// 🔴 Replace with your actual MongoDB connection string
const mongoURI =
  "mongodb+srv://adhavan1311:i5hub@cluster0.c3c1i.mongodb.net/growth-guardian?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1); // Exit if connection fails
  }
};

module.exports = connectDB;
