const express = require("express");
const Item = require("../models/Item");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, async(req, res) => {
    try {
        const {
            itemName,
            category,
            description,
            location,
            date,
            type,
            image,
        } = req.body;

        if (!itemName ||
            !category ||
            !description ||
            !location ||
            !date ||
            !type
        ) {
            return res.status(400).json({
                message: "All required fields must be provided",
            });
        }

        const item = await Item.create({
            itemName,
            category,
            description,
            location,
            date,
            type,
            image: image || "",
            reportedBy: req.user.userId,
        });

        res.status(201).json({
            message: "Item reported successfully",
            item,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to report item",
            error: error.message,
        });
    }
});

router.get("/", async(req, res) => {
    try {
        const { search, category, location, type } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                { itemName: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        if (category) {
            filter.category = category;
        }

        if (location) {
            filter.location = {
                $regex: location,
                $options: "i",
            };
        }

        if (type) {
            filter.type = type;
        }

        const items = await Item.find(filter)
            .populate("reportedBy", "name email")
            .sort({ createdAt: -1 });

        res.json(items);
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve items",
            error: error.message,
        });
    }
});

router.get("/:id", async(req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate(
            "reportedBy",
            "name email"
        );

        if (!item) {
            return res.status(404).json({
                message: "Item not found",
            });
        }

        res.json(item);
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve item",
            error: error.message,
        });
    }
});

router.put("/:id", protect, async(req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found",
            });
        }

        if (item.reportedBy.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can update only your own item",
            });
        }

        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            req.body, {
                new: true,
                runValidators: true,
            }
        );

        res.json({
            message: "Item updated successfully",
            item: updatedItem,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update item",
            error: error.message,
        });
    }
});

router.delete("/:id", protect, async(req, res) => {
    try {
        const item = await Item.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                message: "Item not found",
            });
        }

        if (item.reportedBy.toString() !== req.user.userId) {
            return res.status(403).json({
                message: "You can delete only your own item",
            });
        }

        await Item.findByIdAndDelete(req.params.id);

        res.json({
            message: "Item deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete item",
            error: error.message,
        });
    }
});

module.exports = router;