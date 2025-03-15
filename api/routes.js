const express = require("express");
const { textChecker } = require("./controllers/scamChecker");
const router = express.Router();

// Test route
router.get("/home", (req, res) => {
  res.json({ message: "Welcome to the API!" });
});

router.post("/scamDetectorText", textChecker);

module.exports = router;
