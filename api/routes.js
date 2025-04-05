const express = require("express");
const { textChecker } = require("./controllers/scamChecker");
const { fundAnalyzer } = require("./controllers/fundsAnalyzer");
const { getChatResponse } = require("./controllers/chatBot");
const { getMessage } = require("./controllers/telebot");
const router = express.Router();

// Test route
router.get("/home", (req, res) => {
  res.send("HELLO");
});

router.post("/scamDetectorText", textChecker);
router.post("/fundAnalyzer", fundAnalyzer);
router.post("/chatBot", getChatResponse);
router.post("/teleBot", getMessage);

module.exports = router;
