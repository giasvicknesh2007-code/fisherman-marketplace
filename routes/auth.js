const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");

const router = express.Router();

// Helper to generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
router.post(
    "/signup",
    [
        body("name", "Name is required").not().isEmpty(),
        body("email", "Please include a valid email").isEmail(),
        body("password", "Please enter a password with 6 or more characters").isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ success: false, message: "User already exists" });
            }

            const user = await User.create({ name, email, password });

            if (user) {
                res.status(201).json({
                    success: true,
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id, user.role),
                });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post(
    "/login",
    [
        body("email", "Please include a valid email").isEmail(),
        body("password", "Password is required").exists(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            const user = await User.findOne({ email });

            if (user && (await user.comparePassword(password))) {
                res.json({
                    success: true,
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    token: generateToken(user._id, user.role),
                });
            } else {
                res.status(401).json({ success: false, message: "Invalid email or password" });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

module.exports = router;
