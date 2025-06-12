const express = require("express");
const router = express.Router();
const assinaturaController = require("../controllers/assinaturaController");

// Rotas para Assinaturas
router.put(
  "/:id/cancelar",
  assinaturaController.cancelarAssinatura
); // Rota para cancelar assinatura
router.get(
  "/status",
  assinaturaController.verificarStatusAssinatura
);

// Rota para Webhook do Pagar.me (NÃO DEVE SER PROTEGIDA POR verifyToken, mas DEVE ter validação de assinatura do webhook)
router.post("/webhook", assinaturaController.atualizarStatusPagamento); // Pagar.me irá chamar esta rota

module.exports = router;
