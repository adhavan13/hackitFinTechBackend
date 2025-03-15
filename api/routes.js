const express = require("express");
const { textChecker } = require("./controllers/scamChecker");
const { fundAnalyzer } = require("./controllers/fundsAnalyzer");
const router = express.Router();

// Test route
router.get("/home", (req, res) => {
  res.send("HELLO");
});

router.post("/scamDetectorText", textChecker);
router.post("/fundAnalyzer", fundAnalyzer);

module.exports = router;
