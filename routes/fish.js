const express = require("express");
const Fish = require("../models/Fish");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// @route   POST /api/fish
// @desc    Create a new listing (Protected)
router.post("/", authMiddleware, async (req, res, next) => {
    try {
        const { name, price, location } = req.body;
        
        const fish = await Fish.create({
            name,
            price,
            location,
            owner: req.user.id
        });

        res.status(201).json({ success: true, data: fish });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/fish
// @desc    View all listings (Public)
router.get("/", async (req, res, next) => {
    try {
        const listings = await Fish.find().populate("owner", "name email");
        res.json({ success: true, data: listings });
    } catch (error) {
        next(error);
    }
});

// @route   PUT /api/fish/:id
// @desc    Update own listing (Protected + Ownership)
router.put("/:id", authMiddleware, async (req, res, next) => {
    try {
        let fish = await Fish.findById(req.params.id);

        if (!fish) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        // Ownership Security
        if (fish.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to update this listing" });
        }

        fish = await Fish.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: fish });
    } catch (error) {
        next(error);
    }
});

// @route   DELETE /api/fish/:id
// @desc    Delete own listing (Protected + Ownership)
router.delete("/:id", authMiddleware, async (req, res, next) => {
    try {
        const fish = await Fish.findById(req.params.id);

        if (!fish) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        // Ownership Security
        if (fish.owner.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this listing" });
        }

        await fish.deleteOne();
        res.json({ success: true, message: "Listing deleted successfully" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
