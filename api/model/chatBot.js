const mongoose = require("mongoose");

const priviousMessage = new mongoose.Schema(
  {
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const priviousMessageSchema = mongoose.model("privious", priviousMessage);
module.exports = priviousMessageSchema;
