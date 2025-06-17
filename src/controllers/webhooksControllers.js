const webhooks = async (req, res) => {
  // Tornar a função assíncrona para operações futuras (ex: DB, API)
  try {
    const evento = req.body;

    // --- Validação básica para evitar processar requisições inválidas ---
    if (!evento || Object.keys(evento).length === 0) {
      console.warn("⚠️ Webhook recebido vazio ou inválido.");
      return res.status(400).send("Requisição inválida"); // Retorna 400 para bad request
    }

    console.log("📩 Webhook recebido:");
    // Usar JSON.stringify para um log mais limpo e legível em ambientes de produção
    // { depth: null } no console.dir é bom para dev, mas em produção pode ser verboso demais
    console.log(JSON.stringify(evento, null, 2));

    // Verifique o tipo do evento de forma mais robusta, considerando diferentes estruturas
    // Mercado Pago pode enviar 'type' ou 'topic' para identificar o evento
    const tipo = evento.type || evento.topic || evento.action;

    // --- Processamento de Eventos Específicos ---
    switch (tipo) {
      case "payment":
        // Verifica se evento.data e evento.data.id existem para evitar erros
        const paymentId = evento.data?.id;

        if (!paymentId) {
          console.warn("⚠️ Evento de pagamento recebido sem ID de pagamento.");
          // Pode retornar um 400 ou 200, dependendo da sua tolerância a eventos "incompletos"
          return res.status(400).send("ID do pagamento ausente.");
        }

        console.log(`💰 Pagamento atualizado: ID = ${paymentId}`);

        // --- EXERCÍCIO IMPORTANTE: Persistência de Dados e Lógica de Negócio ---
        // Aqui é onde a lógica real de atualização do seu sistema acontece.
        // É CRÍTICO que essa parte seja robusta.
        try {
          // Exemplo de como você CHAMARIA uma função para atualizar o banco de dados
          // await atualizarStatusDoPagamentoNoBanco(paymentId, 'aprovado', evento);
          // await registrarTransacaoNoCaixa(paymentId, evento.data.transaction_amount);

          // Lembre-se de tratar casos de sucesso e falha da atualização do DB
          console.log(
            `✅ Lógica de negócio para o pagamento ${paymentId} processada.`
          );
        } catch (dbError) {
          console.error(
            `❌ Erro ao atualizar o banco de dados para o pagamento ${paymentId}:`,
            dbError.message
          );
          // Decida se você quer retornar 500 aqui para que o Mercado Pago tente novamente,
          // ou 200 se você registrou o erro e não quer re-tentativas desnecessárias.
          // Para idempotência, geralmente é melhor retornar 200 se você já "recebeu" o webhook.
          // O tratamento de erro DEVE garantir que o DB esteja consistente.
          return res.status(500).send("Erro interno ao processar pagamento.");
        }
        break;

      case "merchant_order": // Exemplo de outro tipo de evento comum
        console.log(`📦 Ordem de compra atualizada: ID = ${evento.resource}`);
        // Implementar lógica para ordens de compra
        break;

      // Adicione outros cases para tipos de eventos que você precise processar
      default:
        console.log(
          `ℹ️ Tipo de evento desconhecido ou não processado: ${tipo}`
        );
        break;
    }

    // --- Resposta obrigatória e crucial para o Mercado Pago ---
    // Sempre retorne 200 OK para indicar que você recebeu e processou o webhook.
    // Isso evita que o Mercado Pago continue tentando reenviar o mesmo evento.
    res.status(200).send("OK");
  } catch (error) {
    console.error(
      "❌ Erro catastrófico no webhook:",
      error.message,
      error.stack
    );
    // Em caso de erro, o Mercado Pago espera um status diferente de 2xx para re-tentar.
    // Retornar 500 é o padrão para erros internos.
    res.status(500).send("Erro interno no webhook");
  }
};

module.exports = { webhooks };
