const express = require("express");
const router = express.Router();

// Minimal test route
router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Auth routes working"
    });
});

// Minimal signup test
router.post("/signup", (req, res) => {
    console.log("SIGNUP HIT");

    res.json({
        success: true,
        message: "Signup hit successfully",
        body: req.body
    });
});

module.exports = router;
