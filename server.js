require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// Routes
const jobsRoutes = require("./routes/jobs");
const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protectedRoutes");
const fishRoutes = require("./routes/fish");

// Middleware
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

// Mount Routes
app.use("/api/jobs", jobsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/fish", fishRoutes);

// Root
app.get("/", (req, res) => {
    res.send("Fisherman Marketplace API Running");
});

// Centralized Error Handler (must be after routes)
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
