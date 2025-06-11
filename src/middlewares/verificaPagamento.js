const db = require("../config/db");

const verificaPagamento = async (req, res, next) => {
  try {
    const id_usuario = req.user?.id_usuario;

    if (!id_usuario) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }

    // Busca a assinatura mais recente do usuário
    const [assinaturas] = await db.query(
      "SELECT * FROM assinaturas WHERE id_usuario = ? ORDER BY data_fim DESC LIMIT 1",
      { replacements: [id_usuario] }
    );

    const assinatura = assinaturas[0];

    if (!assinatura) {
      return res.status(404).json({ error: "Assinatura não encontrada" });
    }

    const data_fim = new Date(assinatura.data_fim);
    data_fim.setHours(0, 0, 0, 0);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (data_fim < hoje) {
      return res
        .status(403)
        .json({ error: "Pagamento vencido: conta bloqueada" });
    }

    next(); // tudo ok, segue o baile
  } catch (err) {
    console.error("Erro no middleware de pagamento:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
};

module.exports = verificaPagamento;
