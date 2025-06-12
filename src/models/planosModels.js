const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Ajuste este caminho para o seu arquivo de configuração do Sequelize

const Plano = sequelize.define('Plano', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2), // Corresponde a DECIMAL(10,2) no banco de dados
    allowNull: false
  },
  tarefas_inclusas: {
    type: DataTypes.TEXT, // Corresponde a TEXT para campos de texto longos
    allowNull: true // Assumindo que este campo pode ser nulo
  }
}, {
  tableName: 'planos', // Especifica explicitamente o nome da tabela no banco de dados
  timestamps: false // Define como 'false' se a tabela 'planos' não tiver as colunas 'createdAt' e 'updatedAt'
});

module.exports = Plano;