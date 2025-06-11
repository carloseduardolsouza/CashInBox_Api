const db = require('../config/db');

const Assinatura = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM assinaturas');
    return rows;
  },
  async create({ cliente_id, plano_id, data_inicio, data_fim }) {
    const [result] = await db.query(
      'INSERT INTO assinaturas (cliente_id, plano_id, data_inicio, data_fim) VALUES (?, ?, ?, ?)',
      [cliente_id, plano_id, data_inicio, data_fim]
    );
    return result.insertId;
  },
};

module.exports = Assinatura;