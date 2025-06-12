// Importa os modelos necessários. Ajuste os caminhos conforme a estrutura do seu projeto.
const Usuario = require("../models/usuariosModels");
const Assinatura = require("../models/assinaturaModels"); // Verifique o nome do arquivo (singular/plural)
const Plano = require("../models/planosModels");

const frequencia = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message:
          "ID do usuário não encontrado na requisição. Certifique-se de usar o middleware de autenticação.",
      });
    }

    const usuario = await Usuario.findByPk(userId);

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    await usuario.update({
      ultimo_acesso: new Date(),
    });

    const assinatura = await Assinatura.findOne({
      where: {
        usuario_id: userId,
        status: "ativa",
      },
      include: [
        {
          model: Plano,
          as: "plano",
          attributes: ["tarefas_inclusas"],
        },
      ],
    });

    if (!assinatura) {
      return res.status(404).json({ message: "Usuário sem assinatura ativa." });
    }

    const dataAtual = new Date();
    if (assinatura.vencimento_em && assinatura.vencimento_em < dataAtual) {
      return res.status(403).json({
        message: "Assinatura vencida. Por favor, renove sua assinatura.",
      });
    }

    if (
      !assinatura.plano ||
      assinatura.plano.tarefas_inclusas === undefined || // Verifica se tarefas_inclusas existe
      assinatura.plano.tarefas_inclusas === null // E se não é nula
    ) {
      return res.status(500).json({
        message:
          "Informações do plano (nível de acesso ou tarefas inclusas) não encontradas para a assinatura ativa. Verifique o modelo 'Plano' e a tabela do banco de dados.",
      });
    }

    res.status(200).json({
      message: "Último acesso atualizado com sucesso!",
      vencimento_assinatura: assinatura.vencimento_em,
      nivel_acesso: assinatura.plano.tarefas_inclusas,
    });
  } catch (error) {
    console.error("Erro na função frequencia:", error);
    res.status(500).json({
      message:
        "Ocorreu um erro ao processar a frequência e buscar informações da assinatura.",
      error: error.message,
    });
  }
};

module.exports = {
  frequencia,
};
