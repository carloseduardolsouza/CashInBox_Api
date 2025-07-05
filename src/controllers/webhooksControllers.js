const { MercadoPagoConfig, Payment } = require("mercadopago");
const { Assinatura } = require("../models/assinaturaModels"); // Ajuste o path conforme seu projeto
const { Op } = require("sequelize");
require("dotenv").config();

const client = new MercadoPagoConfig({
  accessToken: process.env.TOKEN_MERCADO_PAGO,
});

const payment = new Payment(client);

const webhooks = async (req, res) => {
  try {
    const evento = req.body;

    if (!evento || Object.keys(evento).length === 0) {
      console.warn("⚠️ Webhook vazio ou inválido.");
      return res.status(400).send("Requisição inválida");
    }

    console.log("📩 Webhook recebido:");
    console.log(JSON.stringify(evento, null, 2));

    const tipo = evento.type || evento.topic || evento.action;

    if (tipo === "payment") {
      const paymentId = evento.data?.id;
      const action = evento.action;

      if (!paymentId) {
        console.warn("⚠️ Pagamento sem ID.");
        return res.status(400).send("ID do pagamento ausente.");
      }

      console.log(
        `💰 Pagamento atualizado: ID = ${paymentId} | Action: ${action}`
      );

      if (action === "payment.created") {
        try {
          const pagamento = await payment.get({ id: paymentId });
          const metadata = pagamento.metadata || {};
          const idInterno = metadata.idInterno;

          if (!idInterno) {
            console.warn(`⚠️ Metadata ausente para pagamento ${paymentId}`);
            return res.status(400).send("Metadata idInterno ausente.");
          }

          // Buscar assinatura no DB
          const assinatura = await Assinatura.findOne({
            where: { id: idInterno },
          });

          if (!assinatura) {
            console.warn(
              `⚠️ Assinatura não encontrada para ID interno ${idInterno}`
            );
            return res.status(404).send("Assinatura não encontrada.");
          }

          const hoje = new Date();
          let novoVencimento;

          if (assinatura.vencimento_em && assinatura.vencimento_em >= hoje) {
            // Data válida → soma 30 dias ao vencimento atual
            novoVencimento = new Date(assinatura.vencimento_em);
            novoVencimento.setDate(novoVencimento.getDate() + 30);
          } else {
            // Vencido → pega hoje + 30 dias
            novoVencimento = new Date();
            novoVencimento.setDate(hoje.getDate() + 30);
          }

          // Atualiza assinatura
          assinatura.status = "ativa";
          assinatura.vencimento_em = novoVencimento;

          await assinatura.save();

          console.log(
            `✅ Assinatura ${idInterno} atualizada: status=ativa, vencimento_em=${novoVencimento.toISOString()}`
          );

          res.status(200).send("Assinatura atualizada com sucesso.");
        } catch (dbError) {
          console.error(`❌ Erro ao atualizar assinatura:`, dbError);
          return res.status(500).send("Erro ao atualizar assinatura.");
        }
      } else {
        // Se não for payment.updated, só confirma OK
        res
          .status(200)
          .send("Evento payment recebido, mas sem ação específica.");
      }
    } else {
      console.log(`ℹ️ Evento não tratado: ${tipo}`);
      res.status(200).send("Evento ignorado.");
    }
  } catch (error) {
    console.error("❌ Erro geral no webhook:", error.message);
    res.status(500).send("Erro interno no webhook");
  }
};

module.exports = { webhooks };
