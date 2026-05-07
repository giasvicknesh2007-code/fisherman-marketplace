const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// @route   GET /api/protected/profile
// @desc    A sample protected route that requires a valid JWT
router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "Protected route working",
        user: req.user
    });
});

module.exports = router;
