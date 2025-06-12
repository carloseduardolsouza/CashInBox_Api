// Importa o modelo Usuario. Ajuste o caminho conforme a estrutura do seu projeto.
const Usuario = require("../models/usuariosModels");
/**
 * @function frequencia
 * @description Atualiza a coluna 'ultimo_acesso' do usuário logado para a data e hora atuais.
 * Esta função espera que o 'req.userId' seja definido por um middleware de autenticação (ex: verifyToken).
 * @param {Object} req - Objeto de requisição do Express.
 * @param {Object} res - Objeto de resposta do Express.
 */
const frequencia = async (req, res) => {
  try {
    // Pega o ID do usuário que foi anexado ao objeto req pelo middleware verifyToken.
    const userId = req.userId;

    // Verifica se o userId está disponível. Se não, significa que o middleware de autenticação não foi executado ou falhou.
    if (!userId) {
      return res.status(401).json({
        message:
          "ID do usuário não encontrado na requisição. Certifique-se de usar o middleware de autenticação.",
      });
    }

    // Busca o usuário pelo ID.
    const usuario = await Usuario.findByPk(userId);

    // Se o usuário não for encontrado (o que seria incomum se o token for válido), retorna 404.
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    // Atualiza a coluna 'ultimo_acesso' para a data e hora atuais.
    // DataTypes.NOW é uma constante do Sequelize que representa a data e hora atuais do banco de dados.
    await usuario.update({
      ultimo_acesso: new Date(), // Ou DataTypes.NOW se você preferir que o banco de dados gere o timestamp
    });

    // Retorna uma resposta de sucesso.
    res.status(200).json({ message: "Último acesso atualizado com sucesso!" });
  } catch (error) {
    // --- Tratamento de Erros ---
    console.error("Erro ao atualizar último acesso:", error);
    res.status(500).json({
      message: "Ocorreu um erro ao tentar atualizar o último acesso.",
      error: error.message,
    });
  }
};

module.exports = {
  frequencia, // Adiciona a nova função ao objeto exportado
};
