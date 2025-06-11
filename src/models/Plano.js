const db = require("../config/db");

const Plano = {
  async getAll() {
    const [rows] = await db.query("SELECT * FROM planos");
    return rows;
  },
  async create({ nome, preco, duracao_dias, descricao }) {
    const [result] = await db.query(
      "INSERT INTO planos (nome, preco, duracao_dias, descricao) VALUES (?, ?, ?, ?)",
      { replacements: [nome, preco, duracao_dias, descricao] }
    );
    return result.insertId;
  },
};

module.exports = Plano;
