const mongoose = require("mongoose");

const ChatHistory = new mongoose.Schema(
  {
    user: { type: String, required: true },
    model: { type: String, required: true},
  },
  { timestamps: true }
);

const ChathistorySchema = mongoose.model("chathistory", ChatHistory);
module.exports = ChathistorySchema;
