const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// @route   GET /api/protected/dashboard
// @desc    A sample protected route that requires a valid JWT
router.get("/dashboard", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "Protected route accessed",
        user: req.user
    });
});

module.exports = router;
