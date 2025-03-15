const express = require("express");
const { textChecker } = require("./controllers/scamChecker");
const router = express.Router();

// Test route
router.get("/home", (req, res) => {
  res.send("HELLO")
});

router.post("/scamDetectorText", textChecker);

module.exports = router;
