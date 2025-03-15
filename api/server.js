const express = require('express')
const cors = require('cors')
const router = require('./routes')

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", router); // All routes prefixed with /api

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
