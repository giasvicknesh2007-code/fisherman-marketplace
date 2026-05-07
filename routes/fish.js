const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const Fish = require("../models/Fish");
const auth = require("../middleware/authMiddleware");

const upload = multer({ storage });

// @route   GET /api/fish
router.get("/", async (req, res) => {
    try {
        const { location, search } = req.query;
        let query = {};
        if (location) query.location = location;
        if (search) query.name = { $regex: search, $options: "i" };

        const fish = await Fish.find(query)
            .populate("owner", "name email")
            .sort({ createdAt: -1 });

        res.json({ success: true, count: fish.length, data: fish });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/fish
// @desc    Create a listing with image upload
router.post(
    "/",
    auth,                   // 1. Verify Token
    upload.single("image"), // 2. Parse Multipart Data (Populates req.body)
    async (req, res) => {
        try {
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Request body is empty. Ensure you are sending FormData correctly."
                });
            }

            // Using the names provided by the user in their latest request
            const { name, price, location, phone } = req.body;

            if (!name || !price || !location || !phone) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required (name, price, location, phone)"
                });
            }

            const imageUrl = req.file ? req.file.path : "";

            const newFish = new Fish({
                name,
                price: parseFloat(price),
                location,
                phone,
                imageUrl,
                owner: req.user.id
            });

            const savedFish = await newFish.save();
            res.status(201).json({ success: true, data: savedFish });
        } catch (error) {
            console.error("Fish Create Error:", error);
            res.status(400).json({ success: false, message: error.message });
        }
    }
);

// @route   DELETE /api/fish/:id
router.delete("/:id", auth, async (req, res) => {
    try {
        const fish = await Fish.findById(req.params.id);

        if (!fish) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        // SERVER-SIDE OWNERSHIP ENFORCEMENT
        if (fish.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only delete your own listings"
            });
        }

        await fish.deleteOne();
        res.json({ success: true, message: "Listing removed" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
