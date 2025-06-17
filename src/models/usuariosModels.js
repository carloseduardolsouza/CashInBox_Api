const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Ajuste o caminho se precisar

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  senha_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'user'
  },
  ativo: {
    type: DataTypes.BOOLEAN, // Melhor usar boolean no Sequelize
    allowNull: false,
    defaultValue: true
  },
  data_criacao: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  ultimo_acesso: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },

  // Colunas novas que você quer adicionar:
  rua: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  cidade: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  estado: {
    type: DataTypes.STRING(2),
    allowNull: true,
  },
  cpf_cnpj: {
    type: DataTypes.STRING(20),
    allowNull: true,
  }
}, {
  tableName: 'usuarios',
  timestamps: false // Mantém false pra não usar createdAt e updatedAt do Sequelize
});

module.exports = Usuario;
