const express = require('express');
const app = express();
const clienteRoutes = require('./routes/clienteRoutes');

app.use(express.json());

app.use('/clientes', clienteRoutes);

// Aqui você pode adicionar mais rotas:
  // /planos
  // /assinaturas
  // /pagamentos

module.exports = app;
