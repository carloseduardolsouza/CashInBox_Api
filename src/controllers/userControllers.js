// Importa os modelos necessários. Ajuste os caminhos conforme a estrutura do seu projeto.
const Usuario = require("../models/usuariosModels");
const Assinatura = require("../models/assinaturaModels"); // Verifique o nome do arquivo (singular/plural)
const Plano = require("../models/planosModels");

const Boleto = require("../models/boletosModels");

const gerarBoletoMP = require("../services/gerarBoleto");
const { Op } = require("sequelize");

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

const gerarBoleto = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    const assinatura = await Assinatura.findOne({
      where: { usuario_id: userId },
    });
    if (!assinatura) {
      return res.status(404).json({ error: "Assinatura não encontrada." });
    }

    const usuario = await Usuario.findOne({ where: { id: userId } });
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const boletos = await Boleto.findAll({
      where: {
        usuario_id: userId,
        status: {
          [Op.or]: ["PENDENTE", "VENCIDO"],
        },
      },
    });

    if (boletos.length > 0) {
      return res.status(200).json(boletos);
    }

    const plano = await Plano.findOne({ where: { id: assinatura.plano_id } });
    if (!plano) {
      return res.status(404).json({ error: "Plano não encontrado." });
    }

    const cliente = {
      email: usuario.email || "cliente@exemplo.com",
      primeiro_nome: usuario.nome?.split(" ")[0] || "Cliente",
      ultimo_nome: usuario.nome?.split(" ").slice(1).join(" ") || "Nome",
      cpnpj: usuario.cpf_cnpj || "00000000000191",
      endereco: {
        nome: usuario.rua || "Rua Fictícia",
        cidade: usuario.cidade || "Cidade",
        uf: usuario.estado || "SP",
      },
    };

    const boleto = {
      valor: plano.valor || 199.9,
      vencimento: assinatura.vencimento_em
        ? new Date(assinatura.vencimento_em).toISOString()
        : null,
    };

    const resultado = await gerarBoletoMP.gerarBoleto(cliente, boleto);

    // 💾 Salva no banco
    await Boleto.create({
      usuario_id: userId,
      valor: plano.valor,
      status: "PENDENTE",
      url: resultado.visualizacao || null,
    });

    // Supondo que resultado tenha os dados do boleto para enviar
    return res.status(200).json(resultado);
  } catch (error) {
    console.error("❌ Erro ao gerar boleto via req.user.id:", error);
    return res.status(500).json({
      error: "Erro ao processar geração de boleto.",
      detalhe: error.message || error,
    });
  }
};

const informacoesPlano = async (req, res) => {
  try {
    const userId = req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Usuário não autenticado." });
    }

    const assinatura = await Assinatura.findOne({
      where: { usuario_id: userId },
      include: [
        {
          model: Plano,
          as: "plano",
          attributes: ["nome", "valor"],
        },
      ],
    });

    if (!assinatura) {
      return res.status(404).json({ message: "Assinatura não encontrada." });
    }

    if (!assinatura.plano) {
      return res
        .status(500)
        .json({ message: "Plano não vinculado à assinatura." });
    }

    res.status(200).json({
      plano: assinatura.plano.nome,
      valor: assinatura.plano.valor,
      vencimento_em: assinatura.vencimento_em,
    });
  } catch (error) {
    console.error("❌ Erro ao obter informações do plano:", error);
    res.status(500).json({
      message: "Erro ao buscar informações do plano.",
      detalhe: error.message || error,
    });
  }
};

module.exports = {
  frequencia,
  gerarBoleto,
  informacoesPlano,
};
