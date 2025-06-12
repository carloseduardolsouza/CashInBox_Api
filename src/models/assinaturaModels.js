const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Ajuste o caminho para a sua configuração do Sequelize
const Usuario = require("./usuariosModels"); // Importa o modelo Usuario
const Plano = require("./planosModels"); // Importa o modelo Plano

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
      allowNull: true, // Corresponde ao DATETIME sem NOT NULL no SQL
    },
    vencimento_em: {
      type: DataTypes.DATE,
      allowNull: true, // Corresponde ao DATETIME sem NOT NULL no SQL
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios", // Nome da tabela no banco de dados para a FK
        key: "id",
      },
    },
    plano_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "planos", // Nome da tabela no banco de dados para a FK
        key: "id",
      },
    },
    status: {
      // Usando ENUM para garantir a integridade dos dados, como na sua requisição anterior,
      // mesmo que a query SQL inicial tenha VARCHAR. Isso é mais robusto.
      type: DataTypes.ENUM("ativa", "inativa", "cancelada", "suspensa"),
      allowNull: false,
      defaultValue: "inativa", // Valor padrão inicial
    },
    status_pagamento: {
      // Usando ENUM pelas mesmas razões do 'status'.
      type: DataTypes.ENUM(
        "pendente",
        "pago",
        "atrasado",
        "falhou",
        "estornado"
      ),
      allowNull: false,
      defaultValue: "pendente", // Valor padrão inicial
    },
  },
  {
    tableName: "assinaturas", // Garante que o Sequelize use 'assinaturas' como nome da tabela
    timestamps: true, // Sequelize gerenciará 'createdAt' e 'updatedAt' automaticamente
  }
);

// --- Definição das Associações ---
// Uma Assinatura pertence a um Usuário
Assinatura.belongsTo(Usuario, {
  foreignKey: "usuario_id",
  as: "usuario", // Alias para quando for buscar (ex: Assinatura.findOne({ include: 'usuario' }))
});

// Uma Assinatura pertence a um Plano
Assinatura.belongsTo(Plano, {
  foreignKey: "plano_id",
  as: "plano", // Alias para quando for buscar (ex: Assinatura.findOne({ include: 'plano' }))
});

// Um Usuário pode ter muitas Assinaturas
Usuario.hasMany(Assinatura, {
  foreignKey: "usuario_id",
  as: "assinaturas",
});

// Um Plano pode ter muitas Assinaturas
Plano.hasMany(Assinatura, {
  foreignKey: "plano_id",
  as: "assinaturas",
});

module.exports = Assinatura;
