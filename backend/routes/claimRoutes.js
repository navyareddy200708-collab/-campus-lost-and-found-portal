const express = require("express");
const Claim = require("../models/Claim");
const Item = require("../models/Item");
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

// Submit a claim
router.post("/", protect, async(req, res) => {
    try {
        const { item, message } = req.body;

        if (!item || !message) {
            return res.status(400).json({
                message: "Item and message are required",
            });
        }

        const existingItem = await Item.findById(item);

        if (!existingItem) {
            return res.status(404).json({
                message: "Item not found",
            });
        }

        const claim = await Claim.create({
            item,
            claimedBy: req.user.userId,
            message,
        });

        res.status(201).json({
            message: "Claim submitted successfully",
            claim,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to submit claim",
            error: error.message,
        });
    }
});

// Get claims of logged-in user
router.get("/my", protect, async(req, res) => {
    try {
        const claims = await Claim.find({
                claimedBy: req.user.userId,
            })
            .populate("item")
            .sort({ createdAt: -1 });

        res.json(claims);
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve claims",
            error: error.message,
        });
    }
});

// Get all claims - Admin only
router.get("/", protect, adminOnly, async(req, res) => {
    try {
        const claims = await Claim.find()
            .populate("item")
            .populate("claimedBy", "name email")
            .sort({ createdAt: -1 });

        res.json(claims);
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve claims",
            error: error.message,
        });
    }
});

// Update claim status - Admin only
router.put("/:id/status", protect, adminOnly, async(req, res) => {
    try {
        const { status } = req.body;

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "Status must be approved or rejected",
            });
        }

        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({
                message: "Claim not found",
            });
        }

        claim.status = status;
        await claim.save();

        if (status === "approved") {
            await Item.findByIdAndUpdate(claim.item, {
                status: "claimed",
            });
        }

        res.json({
            message: `Claim ${status} successfully`,
            claim,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update claim status",
            error: error.message,
        });
    }
});

module.exports = router;