const db = require("../config/db");

const Cliente = {
  async getAll() {
    const [rows] = await db.query("SELECT * FROM clientes");
    return rows;
  },

  async create(data) {
    const { nome, email, empresa, cpf_cnpj, status_pagamento = "ativo" } = data;

    const [result] = await db.query(
      "INSERT INTO clientes (nome, email, empresa, cpf_cnpj, status_pagamento) VALUES (?, ?, ?, ?, ?)",
      [nome, email, empresa, cpf_cnpj, status_pagamento]
    );

    return result.insertId;
  },

  async findByEmail(email) {
    if (!email) throw new Error("Email é obrigatório para buscar cliente");
    const [rows] = await db.query("SELECT * FROM clientes WHERE email = ?", [email]);
    return rows[0] || null;
  },

  async findByPk(id) {
    if (!id) throw new Error("ID é obrigatório para buscar cliente");
    const [rows] = await db.query("SELECT * FROM clientes WHERE id = ?", [id]);
    return rows[0] || null;
  },
};

module.exports = Cliente;
