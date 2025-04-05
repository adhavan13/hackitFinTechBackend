const axios = require("axios");

// Replace with your real token and chat ID
const BOT_TOKEN = "8134878266:AAFLwWrpPObNok3TnUThP0dlYMHl4le0fAo";
const CHAT_ID = "6447906435";

const getMessage = async (req, res) => {
  try {
    console.log("Received request:", req.body); // Log the incoming request body
    const { alert, name } = req.body;
    if (!alert) {
      return res.status(400).json({ message: "Alert is required" });
    }
    let message = `Alert: ${name}\n${alert}`;
    const response = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text: message,
      }
    );
    res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

module.exports = { getMessage };
