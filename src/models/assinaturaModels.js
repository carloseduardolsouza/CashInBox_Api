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
    // Chave estrangeira para o Usuário
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "usuarios", // Nome da tabela no banco de dados
        key: "id",
      },
    },
    // Chave estrangeira para o Plano
    plano_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "planos", // Nome da tabela no banco de dados
        key: "id",
      },
    },
    data_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Data em que a assinatura foi iniciada
    },
    data_fim: {
      type: DataTypes.DATE,
      allowNull: true, // Data de término prevista (pode ser nula para planos perpétuos ou até o cancelamento)
    },
    status: {
      type: DataTypes.ENUM("ativa", "inativa", "cancelada", "suspensa"), // Status da assinatura em si
      allowNull: false,
      defaultValue: "inativa", // Começa como inativa até o primeiro pagamento ser confirmado
    },
    status_pagamento: {
      type: DataTypes.ENUM(
        "pendente",
        "pago",
        "atrasado",
        "falhou",
        "estornado"
      ), // Status do último pagamento/próximo pagamento
      allowNull: false,
      defaultValue: "pendente",
    },
    data_ultimo_pagamento: {
      type: DataTypes.DATE,
      allowNull: true, // Data do último pagamento efetivado
    },
    proximo_vencimento: {
      type: DataTypes.DATE,
      allowNull: true, // Data do próximo pagamento esperado
    },
    id_transacao_pagarme: {
      type: DataTypes.STRING(255), // ID da transação no Pagar.me
      allowNull: true,
      unique: true, // Opcional: Garante que o ID da transação seja único, útil para evitar duplicatas de webhook
    },
    valor_pago: {
      type: DataTypes.DECIMAL(10, 2), // Valor do último pagamento (pode ser diferente do valor do plano se houver promoções, etc.)
      allowNull: true,
    },
  },
  {
    tableName: "assinaturas", // Nome da tabela no banco de dados
    timestamps: true, // Sequelize gerenciará `createdAt` e `updatedAt` para esta tabela
    // O nome do modelo em camelCase (Assinatura) será convertido para snake_case (assinaturas)
    // para o nome da tabela por padrão, mas é bom especificar.
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
