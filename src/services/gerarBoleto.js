const { MercadoPagoConfig, Payment } = require("mercadopago");
require("dotenv").config();

const client = new MercadoPagoConfig({
  accessToken: process.env.TOKEN_MERCADO_PAGO,
});

const payment = new Payment(client);

async function gerarBoleto(cliente, boleto) {
  const valor = Number(boleto.valor);
  if (isNaN(valor)) {
    throw new Error("Valor do boleto inválido.");
  }

  const payment_data = {
    transaction_amount: valor,
    payment_method_id: "bolbradesco",
    date_of_expiration: boleto.vencimento || "2025-07-15T23:59:59.000-03:00",
    description:
      "Pagamento do PDV Cash In Box. Após o vencimento o programa sera bloqueado ",
    payer: {
      email: cliente.email,
      first_name: cliente.primeiro_nome,
      last_name: cliente.ultimo_nome,
      identification: {
        type: "CPF",
        number: cliente.cpnpj,
      },
      address: {
        zip_code: "06233200",
        street_name: cliente.endereco.nome,
        street_number: "3003",
        neighborhood: "Bonfim",
        city: cliente.endereco.cidade,
        federal_unit: cliente.endereco.uf,
      },
    },
    metadata: {
      idInterno: cliente.assinaturaId,
      clienteId: cliente.id,
    },
  };

  try {
    const response = await payment.create({ body: payment_data });

    const linkVisualizacao =
      response.transaction_details?.external_resource_url;
    const pdfLink = response.point_of_interaction?.transaction_data?.ticket_url;
    const idBoleto = response.id

    return {
      message: "Boleto gerado com sucesso!",
      visualizacao: linkVisualizacao || null,
      pdf: pdfLink || null,
      id: idBoleto || 1,
    };
  } catch (error) {
    console.error("❌ Erro ao gerar boleto:", error);
    throw new Error(error.message || "Erro ao gerar boleto.");
  }
}

module.exports = { gerarBoleto };
