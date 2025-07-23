const express = require("express");
const app = express();

const { atualizarStatusBoletos } = require("./services/rotinas");
const cors = require("cors");

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const verifyToken = require("./middlewares/verifyToken");

const admRoutes = require("./routes/admRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const webhooksRoute = require("./routes/webhooksRoute");
const screenRoute = require("./routes/screenRoute")

// Roda uma vez na inicialização
atualizarStatusBoletos();

// Agenda pra rodar a cada 1 hora
setInterval(atualizarStatusBoletos, 60 * 60 * 1000);

app.use(express.json());

app.use("/" , screenRoute)

app.use("/admin", verifyToken.verifyAdminToken, admRoutes);

app.use("/auth", authRoutes);
app.use("/user", verifyToken.verifyToken, userRoutes);

app.use("/webhooks", webhooksRoute);

module.exports = app;
