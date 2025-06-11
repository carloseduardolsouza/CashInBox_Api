const express = require("express");
const app = express();

const sequelize = require("./config/db");
sequelize
  .sync({ alter: true }) // só usar em dev, em prod usar migrations
  .then(() => console.log("Banco sincronizado"))
  .catch((err) => console.error("Erro ao sincronizar banco:", err));

const clienteRoutes = require("./routes/clienteRoutes");
const planoRoutes = require("./routes/planoRoutes");
const assinaturaRoutes = require("./routes/assinaturaRoutes");
const pagamentoRoutes = require("./routes/pagamentoRoutes");
const autorizacoes = require("./routes/autorizaçãoRoutes");
const userRoutes = require("./routes/userRoutes");
const authMiddleware = require("./middlewares/authMiddleware");

app.use(express.json());

app.use("/usuarios", userRoutes);
app.use("/auth", authRoutes);
app.use("/clientes", authMiddleware, clienteRoutes);
app.use("/planos", authMiddleware, planoRoutes);
app.use("/assinaturas", authMiddleware, assinaturaRoutes);

app.use("/autorizacoes", authMiddleware, autorizacoes);
app.use("/pagamentos", authMiddleware, pagamentoRoutes);

module.exports = app;
