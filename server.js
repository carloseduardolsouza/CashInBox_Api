// index.js ou server.js (seu arquivo principal de inicialização)

// Carrega as variáveis de ambiente do arquivo .env
// Esta linha deve ser uma das primeiras no seu arquivo principal.
require("dotenv").config();

// Importa a instância do Express app configurada
const app = require("./src/app");

// Importa a instância do Sequelize configurada
const sequelize = require("./src/config/db"); // Ajuste o caminho se necessário

// Define a porta do servidor, usando a variável de ambiente PORT ou 3000 como padrão
const PORT = process.env.PORT || 3000;

// Função assíncrona para inicializar o banco de dados e o servidor
const startServer = async () => {
  try {
    // 1. Autentica a conexão com o banco de dados
    await sequelize.authenticate();
    console.log("✅ Conexão ao banco de dados estabelecida com sucesso.");

    // 2. Sincroniza os modelos Sequelize com o banco de dados
    // IMPORTANTE:
    // - Para DESENVOLVIMENTO: use { force: true } para dropar e recriar as tabelas a cada inicialização.
    //   Isso ajuda a evitar problemas de schema, mas APAGA TODOS OS DADOS.
    // - Para PRODUÇÃO: NUNCA use { force: true }. Use um sistema de MIGRAÇÕES (ex: Sequelize CLI migrations)
    //   para gerenciar as alterações do schema de forma segura.
    await sequelize.sync({ force: false }); // Mude para true em DESENVOLVIMENTO se precisar resetar o DB.
    console.log("🔄 Modelos sincronizados com o banco de dados.");

    // 3. Inicia o servidor Express
    const server = app.listen(PORT, () => {
      console.log(`🔥 Servidor rodando na porta ${PORT}`);
    });

    // 4. Tratamento de erros e desligamento gracioso do servidor
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `❌ Porta ${PORT} já está em uso. Tente outra porta ou feche o processo existente.`
        );
      } else {
        console.error("❌ Erro ao iniciar o servidor:", error);
      }
      process.exit(1); // Sai com código de erro
    });

    // Tratamento de sinais de interrupção (Ctrl+C, encerramento de processo)
    process.on("SIGINT", async () => {
      console.log("\n👋 Recebido sinal SIGINT. Encerrando servidor...");
      await server.close(); // Fecha o servidor Express
      await sequelize.close(); // Fecha a conexão com o banco de dados
      console.log("🔌 Servidor e conexão com o banco de dados encerrados.");
      process.exit(0); // Sai com sucesso
    });

    process.on("SIGTERM", async () => {
      console.log("\n👋 Recebido sinal SIGTERM. Encerrando servidor...");
      await server.close(); // Fecha o servidor Express
      await sequelize.close(); // Fecha a conexão com o banco de dados
      console.log("🔌 Servidor e conexão com o banco de dados encerrados.");
      process.exit(0); // Sai com sucesso
    });
  } catch (error) {
    console.error("❌ Erro fatal na inicialização da aplicação:", error);
    process.exit(1); // Sai com código de erro
  }
};

// Chama a função para iniciar o servidor
startServer();
