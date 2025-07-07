const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // ajuste o caminho se necessário

const Boleto = sequelize.define(
  "Boleto",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idBoleto: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    valor: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDENTE", "PAGO", "CANCELADO"),
      defaultValue: "PENDENTE",
      allowNull: false,
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "boletos",
    timestamps: true,
    createdAt: "criado_em",
    updatedAt: "atualizado_em",
  }
);

module.exports = Boleto;
