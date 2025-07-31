const express = require("express");
const router = express.Router();
const { analyzeTaller } = require("../controllers/iaController");

// POST /api/ia/analyze
router.post("/analyze", analyzeTaller);

module.exports = router;
