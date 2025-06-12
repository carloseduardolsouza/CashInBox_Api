const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path to your Sequelize configuration

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
    unique: true // Assuming email should be unique
  },
  senha_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'user' // Common default role
  },
  ativo: {
    type: DataTypes.TINYINT(1), // Or DataTypes.BOOLEAN for better abstraction
    allowNull: false,
    defaultValue: 1 // Assuming 1 means active
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
  }
}, {
  tableName: 'usuarios', // Explicitly specify the table name if it's not the pluralized model name
  timestamps: false // Set to true if you want Sequelize to manage `createdAt` and `updatedAt` columns automatically
});

module.exports = Usuario;