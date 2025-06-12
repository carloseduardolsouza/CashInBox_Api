const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");
const planosController = require("../controllers/planosController");
const assinaturaController = require("../controllers/assinaturaController");

router.post("/cadastrarUsuarios", usuariosController.cadastrar);
router.get("/listarUsuarios", usuariosController.listar);
router.put("/editarUsuarios/:id", usuariosController.editar);
router.delete("/exluirUsuarios/:id", usuariosController.excluir);

router.post("/cadastrarPlanos", planosController.cadastrar);
router.get("/listarPlanos", planosController.listar);
router.put("/editarPlanos/:id", planosController.editar);
router.delete("/exluirPlanos/:id", planosController.excluir);

router.post("/cadastrarAssinatura", assinaturaController.cadastrar);
router.get("/listarAssinaturas", assinaturaController.listar);
router.put("/editarAssinaturas/:id", assinaturaController.editar);
router.delete("/exluirAssinaturas/:id", assinaturaController.excluir);

module.exports = router;
