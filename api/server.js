const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const router = require('../routes'); // Adjust path based on your structure

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", router); // All routes prefixed with /api

module.exports = app;
module.exports.handler = serverless(app); // Convert Express to a Serverless function
