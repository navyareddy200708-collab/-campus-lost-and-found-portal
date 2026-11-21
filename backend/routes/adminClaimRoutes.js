const express = require("express");
const Claim = require("../models/Claim");
const Item = require("../models/Item");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// Get all claims
router.get("/claims", protect, admin, async(req, res) => {
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

// Approve or reject claim
router.put("/claims/:id", protect, admin, async(req, res) => {
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
            message: "Failed to update claim",
            error: error.message,
        });
    }
});

module.exports = router;