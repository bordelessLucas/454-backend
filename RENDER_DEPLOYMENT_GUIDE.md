# Guia de Deploy no Render

## Pré-requisitos
- Conta no [Render.com](https://render.com)
- GitHub conectado ao Render (ou upload manual do repositório)

## Passo a Passo

### 1. **Criar um Banco de Dados PostgreSQL no Render**

1. Acesse [Render.com](https://render.com) e faça login
2. Clique em **+ New +** → **PostgreSQL**
3. Preencha as informações:
   - **Name**: `polls-db` (ou seu nome preferido)
   - **Database**: `polls`
   - **User**: `polls_user`
   - **Region**: Escolha a mais próxima (ex: São Paulo - sp-são-paulo)
   - **PostgreSQL Version**: 15

4. Clique em **Create Database**
5. Aguarde a criação (pode levar 1-2 minutos)
6. **Copie a Connection String** que aparecerá na página - você precisará dela

### 2. **Criar um Serviço Web para a Aplicação**

1. Na dashboard do Render, clique em **+ New +** → **Web Service**
2. Selecione seu repositório GitHub ou **Public Git Repository**
   - Se usar Git público, use: `https://github.com/seu-usuario/seu-repo.git`
3. Preencha as configurações:

   **Build & Deploy**
   - **Name**: `454-backend` (ou um nome descritivo)
   - **Environment**: `Docker`
   - **Region**: Mesma do banco (ex: São Paulo)
   - **Branch**: `main` (ou sua branch principal)

4. Clique em **Next**

### 3. **Configurar Variáveis de Ambiente**

Na seção **Environment**, adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://polls_user:SENHA@seu-host-render.internal:5432/polls
JWT_SECRET=uma-chave-secreta-super-segura-e-complexa
PORT=3000
CORS_ORIGIN=https://seu-frontend.onrender.com
NODE_ENV=production
```

**Notas:**
- Substitua a `DATABASE_URL` pela connection string que você copiou do banco PostgreSQL
- Gere um `JWT_SECRET` seguro (use um gerador online ou `openssl rand -base64 32`)
- Se tiver frontend no Render, use a URL do frontend para `CORS_ORIGIN`

### 4. **Configurar Command e Build**

Na mesma página:

**Build Command** (deixe vazio se não houver)
- Deixe em branco (o Dockerfile cuida disso)

**Start Command**
- Deixe em branco (o Dockerfile contém `CMD ["node", "dist/server.js"]`)

### 5. **Deploy**

1. Clique em **Create Web Service**
2. Acompanhe o deploy na aba **Logs**
3. Quando aparecer "Service is live on...", seu serviço está rodando!

## Executar Migrations no Render

Após o deploy inicial, é necessário rodar as migrations do Prisma. No Render, você pode fazer isso de duas formas:

### Opção 1: Via Console do Render (Recomendado)
1. Acesse seu serviço no Render
2. Vá para a aba **Shell**
3. Execute:
```bash
npx prisma migrate deploy
```

### Opção 2: Adicionar ao Dockerfile
Você pode adicionar ao Dockerfile um comando para rodar as migrations automaticamente:

```dockerfile
# Adicionar no stage 2, antes do CMD final
RUN npx prisma migrate deploy
```

## Testando a API

Após o deploy, teste os endpoints:

```bash
# Health check
curl https://seu-servico.onrender.com/health

# Exemplo de login
curl -X POST https://seu-servico.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "senha"}'
```

## Troubleshooting

### Erro: "Prisma Client Generation Failed"
- Verifique se `package.json` tem `@prisma/client` em dependências
- Confirme que o Dockerfile está gerando o Prisma Client corretamente

### Erro: "Database Connection Failed"
- Verifique se a `DATABASE_URL` está correta
- Confirme que o banco PostgreSQL está em execução no Render
- Ambos serviços precisam estar na mesma região

### Erro: "Container failed to start"
- Verifique os logs no Render (aba Logs)
- Confirme que o `Node.js` versão 20+ está sendo usado

## Variáveis de Ambiente Importantes

```env
# Banco de dados
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=sua-chave-super-secreta

# Servidor
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://seu-frontend.onrender.com
```

## Links Úteis

- [Documentação Render - Docker](https://docs.render.com/docker)
- [Documentação Render - PostgreSQL](https://docs.render.com/databases)
- [Documentação Prisma - Deploy](https://www.prisma.io/docs/orm/prisma-client/deployment/deploy)

## Dúvidas Frequentes

**P: Como atualizar a aplicação no Render?**
- Se conectar ao GitHub, cada push na branch principal fará redeploy automaticamente
- Se usar Git público, você precisa fazer deploy manual via CLI do Render

**P: Como acessar o banco de dados remotamente?**
- Use a connection string do Render no seu cliente PostgreSQL
- Exemplo: `psql postgresql://user:password@host:5432/database`

**P: Qual a diferença de custo entre Docker e Node.js regular?**
- Docker geralmente é mais caro. Use Docker apenas se precisar de dependências especiais.
- Para API Node.js pura, recomenda-se usar "Node.js" como Environment

---

**Boa sorte com o deploy! 🚀**
