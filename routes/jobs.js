const express = require("express");
const Job = require("../models/Job");

const router = express.Router();

// POST a new job
router.post("/", async (req, res) => {
    try {
        const newJob = new Job(req.body);
        const savedJob = await newJob.save();
        res.status(201).json(savedJob);
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});

// GET all jobs
router.get("/", async (req, res) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});

// DELETE a job
router.delete("/:id", async (req, res) => {
    try {
        const deletedJob = await Job.findByIdAndDelete(req.params.id);

        if (!deletedJob) {
            return res.status(404).json({
                message: "Job not found",
            });
        }

        res.json({
            message: "Job deleted successfully",
            deletedJob,
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});

// UPDATE a job
router.put("/:id", async (req, res) => {
    try {
        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );

        if (!updatedJob) {
            return res.status(404).json({
                message: "Job not found",
            });
        }

        res.json(updatedJob);
    } catch (error) {
        res.status(500).json({
            error: error.message,
        });
    }
});

module.exports = router;
