---

# Cash In Box API

API RESTful feita com Node.js + Express, rodando com MySQL via Docker, integrada com Mercado Pago pra pagamentos.
Exposta no seu servidor próprio, usando ngrok pra deixar a API acessível de qualquer canto.

---

## Tecnologias usadas

* Node.js + Express (backend)
* MySQL (banco de dados, rodando em container Docker)
* Docker (pra containerizar o MySQL)
* Mercado Pago (API de pagamentos)
* ngrok (para expor localmente a API pra internet)

---

## Como rodar a API

### 1. Clone o repositório

```bash
git clone https://seu-repositorio.git
cd cash-in-box-api
```

### 2. Configure o Docker com MySQL

Crie um arquivo `docker-compose.yml` com algo assim:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: sua_senha_root
      MYSQL_DATABASE: cashinbox
      MYSQL_USER: usuario
      MYSQL_PASSWORD: senha_usuario
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

E rode:

```bash
docker-compose up -d
```

### 3. Configure variáveis de ambiente

Crie um arquivo `.env` na raiz com as variáveis essenciais, exemplo:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=senha_secreta
DB_NAME=cashinbox
PORT=7777

JWT_SECRET=chave_secreta

MP_ACCESS_TOKEN=seu_token_mercado_pago
```

### 4. Instale as dependências e rode o servidor

```bash
npm install
npm start
```

### 5. Exponha sua API com ngrok

```bash
ngrok http 3000
```

Vai gerar uma URL pública tipo `https://abc123.ngrok.io` que você pode usar pra acessar sua API de qualquer lugar.

---

## Endpoints principais

* `POST /pagamento` — Inicia pagamento via Mercado Pago
* `GET /status/:id` — Consulta status de pagamento
* CRUD de clientes, produtos, vendas, etc (explique aqui seus endpoints)

---

## Observações importantes

* Certifique-se de proteger o token do Mercado Pago e as credenciais do banco
* Para produção, é recomendado não usar ngrok, e sim seu servidor com domínio próprio e HTTPS configurado
* Docker facilita o setup do banco, mas pode ajustar conforme sua infra

---

## Contato

Se der ruim, me chama. E bora fazer esse Cash In Box estourar no mercado!

---

Quer que eu mande até template de docker-compose, script inicial da API, ou algo mais sinistro? Só falar.
