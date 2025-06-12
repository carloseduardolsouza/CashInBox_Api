CashInBox APIEsta é uma API RESTful desenvolvida com Node.js e Express, utilizando Sequelize como ORM para interagir com um banco de dados MySQL/MariaDB. A API gerencia usuários, planos de assinatura e transações de pagamento via Pagar.me, incluindo autenticação baseada em JWT.🚀 Tecnologias UtilizadasNode.js: Ambiente de execução JavaScript.Express.js: Framework web para Node.js.Sequelize: ORM (Object-Relational Mapper) para Node.js (MySQL/MariaDB).MySQL/MariaDB: Banco de dados relacional.bcrypt: Biblioteca para hashing seguro de senhas.jsonwebtoken: Implementação de JSON Web Tokens para autenticação.dotenv: Para carregar variáveis de ambiente de um arquivo .env.Pagar.me SDK: Para integração com a gateway de pagamento Pagar.me.✨ FuncionalidadesGerenciamento de Usuários:Cadastro de novos usuários.Listagem de usuários.Edição de dados de usuários.Exclusão de usuários.Atualização do último acesso do usuário.Autenticação:Login de usuários com email e senha.Geração de JWTs para autenticação e autorização.Middleware para verificação de JWTs e extração de dados do usuário (req.userId, req.user).Gerenciamento de Planos:Cadastro de diferentes planos de serviço.Listagem de planos.Gerenciamento de Assinaturas:Criação de assinaturas vinculando usuários a planos.Listagem de assinaturas (com informações do usuário e plano).Atualização do status de pagamento da assinatura (ideal para webhooks de gateways).Cancelamento de assinaturas.Verificação do status de assinatura de um usuário logado.Integração com Gateway de Pagamento (Pagar.me):Criação de transações (ex: cartão de crédito, boleto, Pix).🛠️ Instalação e ConfiguraçãoPré-requisitosNode.js (LTS recomendado)MySQL ou MariaDB (servidor de banco de dados)PassosClone o repositório:git clone https://github.com/seu-usuario/CashInBox_Api.git
cd CashInBox_Api
Instale as dependências:npm install
Configuração do Banco de Dados:Crie um banco de dados MySQL/MariaDB (ex: cashinbox_db).Crie um arquivo .env na raiz do projeto e configure as variáveis de ambiente para a conexão com o banco de dados e outros segredos.Variáveis de Ambiente (.env)Crie um arquivo .env na raiz do seu projeto com as seguintes variáveis:DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_do_banco
DB_NAME=cashinbox_db
DB_DIALECT=mysql
DB_PORT=3306

PORT=3000

JWT_SECRET=UM_SEGREDO_MUITO_FORTE_PARA_JWT

PAGARME_API_KEY=sua_chave_de_api_secreta_do_pagarme # Chave de API secreta (backend)
PAGARME_ENCRYPTION_KEY=sua_chave_de_criptografia_do_pagarme # Chave de Criptografia (frontend/pode ser usada em certas validações)
Sincronização do Banco de DadosPara criar as tabelas no seu banco de dados (em ambiente de desenvolvimento), a API fará isso automaticamente na inicialização. No entanto, se você enfrentar o erro "Too many keys" novamente, você pode recriar as tabelas manualmente:Pare sua aplicação Node.js.Acesse seu cliente MySQL/MariaDB (MySQL Workbench, phpMyAdmin, DBeaver, etc.).Execute as seguintes queries SQL na ordem:USE seu_nome_do_banco_de_dados; -- Ex: USE cashinbox_db;

DROP TABLE IF EXISTS `assinaturas`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `planos`;

-- Tabela: usuarios
CREATE TABLE `usuarios` (
    `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    `nome` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `senha_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(255) NOT NULL DEFAULT 'user',
    `ativo` TINYINT(1) NOT NULL DEFAULT 1,
    `data_criacao` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ultimo_acesso` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela: planos
CREATE TABLE `planos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `tarefas_inclusas` TEXT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela: assinaturas
CREATE TABLE `assinaturas` (
    `id` INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    `usuario_id` INT NOT NULL,
    `plano_id` INT NOT NULL,
    `data_inicio` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `data_fim` DATETIME NULL,
    `status` ENUM('ativa', 'inativa', 'cancelada', 'suspensa') NOT NULL DEFAULT 'inativa',
    `status_pagamento` ENUM('pendente', 'pago', 'atrasado', 'falhou', 'estornado') NOT NULL DEFAULT 'pendente',
    `data_ultimo_pagamento` DATETIME NULL,
    `proximo_vencimento` DATETIME NULL,
    `id_transacao_pagarme` VARCHAR(255) UNIQUE NULL,
    `valor_pago` DECIMAL(10, 2) NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT `fk_assinatura_usuario`
        FOREIGN KEY (`usuario_id`)
        REFERENCES `usuarios`(`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_assinatura_plano`
        FOREIGN KEY (`plano_id`)
        REFERENCES `planos`(`id`)
        ON DELETE RESTRICT
);
🚀 Como Rodar o ProjetoApós a configuração e sincronização do banco de dados:npm start
O servidor estará rodando em http://localhost:3000 (ou na porta definida em PORT no seu .env).🗺️ Estrutura de Pastas.
├── src/
│   ├── config/
│   │   └── db.js      # Configuração do Sequelize
│   ├── controllers/
│   │   ├── authController.js    # Lógica de autenticação e login
│   │   ├── planosController.js  # Lógica CRUD para planos
│   │   ├── usuariosController.js # Lógica CRUD para usuários
│   │   ├── assinaturaController.js # Lógica CRUD para assinaturas
│   │   └── paymentController.js # Lógica de integração com Pagar.me
│   ├── middleware/
│   │   └── verifyToken.js     # Middleware de verificação de JWT
│   ├── models/
│   │   ├── Assinatura.js      # Modelo Sequelize de Assinatura
│   │   ├── Plano.js           # Modelo Sequelize de Plano
│   │   └── Usuario.js         # Modelo Sequelize de Usuário
│   └── routes/
│       ├── authRoutes.js      # Rotas de autenticação
│       ├── planosRoutes.js    # Rotas para planos
│       ├── usuariosRoutes.js  # Rotas para usuários
│       ├── assinaturaRoutes.js # Rotas para assinaturas
│       └── paymentRoutes.js   # Rotas para pagamentos
│   └── app.js                 # Configurações do Express e middlewares globais
├── .env                       # Variáveis de ambiente
├── .gitignore                 # Arquivos e pastas a serem ignorados pelo Git
├── index.js                   # Ponto de entrada da aplicação (inicia o servidor)
├── package.json               # Dependências e scripts do projeto
└── README.md                  # Este arquivo
🔐 Autenticação (JWT)A API utiliza JWT para autenticação.Login: Envie credenciais (email, senha) para /api/auth/login para receber um token JWT.Rotas Protegidas: Para acessar rotas protegidas (ex: /api/usuarios, /api/assinaturas), inclua o token JWT no cabeçalho Authorization no formato Bearer SEU_TOKEN_AQUI.Exemplo com fetch:fetch('/api/usuarios', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${SEU_TOKEN_JWT}`
  }
});
💳 Gateway de Pagamento (Pagar.me)A integração com o Pagar.me é feita através do paymentController.Criação de Transação: Envie os detalhes da transação para /api/payments/create-transaction.IMPORTANTE: Para transações de cartão de crédito, utilize o SDK de frontend do Pagar.me para gerar um card_hash ou card_id e envie APENAS este hash/ID para sua API. NUNCA envie dados sensíveis do cartão diretamente para sua API em texto puro.Webhooks: Configure webhooks no dashboard do Pagar.me para POST /api/assinaturas/webhook (ou a rota que você configurar). Este endpoint será notificado pelo Pagar.me sobre mudanças de status da transação (paga, recusada, etc.), permitindo que sua API atualize o status da assinatura no banco de dados.⚠️ Observações de DesenvolvimentoO script index.js (ou server.js) está configurado para usar sequelize.sync({ force: false }). Em desenvolvimento, se você fizer muitas alterações no schema e precisar resetar o banco de dados para evitar erros como "Too many keys", você pode temporariamente mudar para force: true (lembre-se que isso apaga os dados). Para produção, o ideal é usar Sequelize Migrations.Considere adicionar um sistema de validação mais robusto (ex: Joi ou express-validator) para os dados de entrada nas suas rotas.Implemente logging adequado para monitorar sua aplicação em produção.Para webhooks do Pagar.me, adicione a verificação da assinatura do webhook para garantir a autenticidade das requisições.