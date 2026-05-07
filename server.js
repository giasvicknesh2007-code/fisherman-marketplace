require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

// Routes
const jobsRoutes = require("./routes/jobs");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protectedRoutes");
const fishRoutes = require("./routes/fish");

// Middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();

// --- SECURITY MIDDLEWARE ---
app.use(helmet({
    contentSecurityPolicy: false,
}));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api/", limiter);

app.use(cors());
app.use(express.json());

// API ROUTES
app.use("/api/jobs", jobsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/fish", fishRoutes);

// STATIC FRONTEND
app.use(express.static(path.join(__dirname, "public")));

// EXCLUDE SYSTEM REQUESTS (Express 5 Compatible Regex)
app.get(/^\/\.well-known\/.*/, (req, res) => {
    res.status(404).end();
});

// --- CATCH-ALL FOR FRONTEND ROUTING (Express 5 Compatible Regex) ---
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Centralized Error Handler
app.use(errorHandler);

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");
})
.catch((error) => {
    console.error("MongoDB Connection Error:", error);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
