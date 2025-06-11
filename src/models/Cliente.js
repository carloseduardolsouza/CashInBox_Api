const db = require('../config/db');

const Cliente = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM clientes');
    return rows;
  },
  async create(data) {
    const { nome, email, empresa, cpf_cnpj } = data;
    const [result] = await db.query(
      'INSERT INTO clientes (nome, email, empresa, cpf_cnpj) VALUES (?, ?, ?, ?)',
      [nome, email, empresa, cpf_cnpj]
    );
    return result.insertId;
  },
  async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM clientes WHERE email = ?', [email]);
    return rows[0];
  },
};

module.exports = Cliente;