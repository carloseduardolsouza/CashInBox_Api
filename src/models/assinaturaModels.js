const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Usuario = require("./usuariosModels");
const Plano = require("./planosModels");

const Assinatura = sequelize.define(
  "Assinatura",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    renovado_em: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    vencimento_em: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios",
        key: "id",
      },
    },
    plano_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "planos",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("ativa", "inativa", "cancelada", "suspensa"),
      allowNull: false,
      defaultValue: "inativa",
    },
    status_pagamento: {
      type: DataTypes.ENUM("pendente", "pago", "atrasado", "falhou", "estornado"),
      allowNull: false,
      defaultValue: "pendente",
    },
    createdAt: {
      type: DataTypes.DATE,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: "updated_at",
    },
  },
  {
    tableName: "assinaturas",
    timestamps: true,
  }
);

// Definindo as associações aqui
// Assinatura pertence a Usuario
Assinatura.belongsTo(Usuario, {
  foreignKey: "usuario_id",
  as: "usuario",
});

// Usuario tem muitas Assinaturas
Usuario.hasMany(Assinatura, {
  foreignKey: "usuario_id",
  as: "assinaturas",
});

// Assinatura pertence a Plano
Assinatura.belongsTo(Plano, {
  foreignKey: "plano_id",
  as: "plano",
});

// Plano tem muitas Assinaturas
Plano.hasMany(Assinatura, {
  foreignKey: "plano_id",
  as: "assinaturas",
});

module.exports = Assinatura;
