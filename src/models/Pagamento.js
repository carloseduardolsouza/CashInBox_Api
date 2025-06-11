const db = require('../config/db');

const Pagamento = {
  async getAll() {
    const [rows] = await db.query('SELECT * FROM pagamentos');
    return rows;
  },
  async create({ cliente_id, valor, metodo, status, data_pagamento, referencia }) {
    const [result] = await db.query(
      'INSERT INTO pagamentos (cliente_id, valor, metodo, status, data_pagamento, referencia) VALUES (?, ?, ?, ?, ?, ?)',
      [cliente_id, valor, metodo, status, data_pagamento, referencia]
    );
    return result.insertId;
  },
};

module.exports = Pagamento;