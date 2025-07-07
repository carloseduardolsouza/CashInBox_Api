require("dotenv").config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const Boleto = require("../models/boletosModels");

const atualizarStatusBoletos = async () => {
  try {
    // Pega todos os boletos do banco
    const boletos = await Boleto.findAll();

    for (const boleto of boletos) {
      // Confere se o campo do id do MercadoPago está certo (idBoleto, id_mercado_pago, etc)
      const idBoleto = boleto.idBoleto || boleto.id_mercado_pago;
      if (!idBoleto) {
        console.warn(`Boleto ${boleto.id} sem id válido para Mercado Pago, pulando`);
        continue;
      }

      // Faz a requisição pra API do Mercado Pago
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${idBoleto}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.TOKEN_MERCADO_PAGO}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.warn(`Erro na requisição para boleto ${idBoleto}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const statusMP = data.status;

      let statusBanco;

      switch (statusMP) {
        case "pending":
          statusBanco = "PENDENTE";
          break;
        case "approved":
          statusBanco = "PAGO";
          break;
        case "cancelled":
          statusBanco = "CANCELADO";
          break;
        default:
          statusBanco = boleto.status; // mantém o que tá no banco
      }

      // Atualiza só se mudou o status pra evitar query inútil
      if (statusBanco !== boleto.status) {
        await boleto.update({ status: statusBanco });
        console.log(`Boleto ${boleto.id} atualizado para ${statusBanco}`);
      }
    }

    console.log("Status dos boletos atualizado com fetch.");
  } catch (error) {
    console.error("Erro ao atualizar boletos:", error);
  }
};

module.exports = { atualizarStatusBoletos };
