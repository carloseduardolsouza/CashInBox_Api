const express = require('express');
const app = express();

const clienteRoutes = require('./routes/clienteRoutes');
const planoRoutes = require('./routes/planoRoutes');
const assinaturaRoutes = require('./routes/assinaturaRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/clientes', authMiddleware, clienteRoutes);
app.use('/planos', authMiddleware, planoRoutes);
app.use('/assinaturas', authMiddleware, assinaturaRoutes);
app.use('/pagamentos', authMiddleware, pagamentoRoutes);

module.exports = app;