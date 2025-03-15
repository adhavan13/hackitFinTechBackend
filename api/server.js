const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const router = require("./routes"); // Adjust path based on your structure

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", router); // All routes prefixed with /api



// Export for Vercel (serverless mode)
module.exports = app;
// module.exports.handler = serverless(app);

const PORT = 8000;
// Run locally
if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}
