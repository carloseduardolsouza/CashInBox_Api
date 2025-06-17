const express = require("express");
const app = express();

const sequelize = require("./config/db");

const verifyToken = require("./middlewares/verifyToken");

const admRoutes = require("./routes/admRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const webhooksRoute = require("./routes/webhooksRoute")

app.use(express.json());

app.use("/admin", verifyToken.verifyAdminToken, admRoutes);

app.use("/auth", authRoutes);
app.use("/user", verifyToken.verifyToken, userRoutes);

app.use ("/webhooks" , webhooksRoute)

module.exports = app;
