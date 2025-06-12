const express = require("express");
const app = express();

const sequelize = require("./config/db");
sequelize
  .sync({ alter: true })
  .then(() => console.log("Banco sincronizado"))
  .catch((err) => console.error("Erro ao sincronizar banco:", err));

const verifyToken = require("./middlewares/verifyToken");

const admRoutes = require("./routes/admRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use(express.json());

app.use("/admin", verifyToken.verifyAdminToken, admRoutes);

app.use("/auth", authRoutes);
app.use("/user", verifyToken.verifyToken, userRoutes);

module.exports = app;
