const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

dotenv.config({
    path: path.resolve(__dirname, "../.env")
});

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const claimRoutes = require("./routes/claimRoutes");
const adminClaimRoutes = require("./routes/adminClaimRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminClaimRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Campus Lost and Found API is running"
    });
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB connected");

        app.listen(process.env.PORT || 5000, () => {

            console.log(
                `Server running on port ${process.env.PORT || 5000}`
            );

        });

    })
    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

    });