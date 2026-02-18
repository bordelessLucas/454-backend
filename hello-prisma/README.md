# Sistema de Relatórios - Backend

Sistema completo de gerenciamento de relatórios técnicos com autenticação JWT e controle de acesso por roles.

## Estrutura do Projeto

```
src/
├── controllers/       # Controllers para cada recurso
├── services/         # Lógica de negócio
├── routes/           # Definição de rotas
├── middlewares/      # Auth, Role e Horário
├── types/            # DTOs e interfaces
└── lib/              # Prisma client
```

## Tecnologias

- Node.js + TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Bcrypt

## Instalação

```bash
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

2. Configure as variáveis no `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/banco?schema=public"
JWT_SECRET="sua-chave-secreta-aqui"
PORT=3000
```

3. Suba o banco PostgreSQL via Docker:

```bash
docker compose up -d
```

4. Execute as migrations:

```bash
npm run prisma:migrate
```

5. Gere o Prisma Client:

```bash
npm run prisma:generate
```

## Executar

### Desenvolvimento

```bash
npm run dev
```

### Produção

```bash
npm run build
npm start
```

## Roles

- **ADMIN**: Acesso total ao sistema
- **TECNICO**: Acesso limitado (CRUD clientes e relatórios)

## Rotas Principais

### Autenticação

- `POST /auth/login` - Login (retorna JWT)

### Usuários (ADMIN only)

- `POST /users` - Criar usuário
- `GET /users` - Listar usuários
- `GET /users/:id` - Buscar usuário
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Deletar usuário

### Clientes (ADMIN e TECNICO)

- `POST /clientes` - Criar cliente
- `GET /clientes` - Listar clientes (filtros: nomeFantasia, cnpj, ramoAtividadeId)
- `GET /clientes/:id` - Buscar cliente
- `PUT /clientes/:id` - Atualizar cliente
- `DELETE /clientes/:id` - Deletar cliente
- `POST /clientes/:id/contatos` - Criar contato
- `PUT /clientes/:id/contatos/:contatoId` - Atualizar contato
- `DELETE /clientes/:id/contatos/:contatoId` - Deletar contato

### Relatórios (ADMIN e TECNICO)

- `POST /relatorios` - Criar relatório
- `GET /relatorios` - Listar relatórios (filtros: clienteId, dataInicio, dataFim, criadoPorId, impresso)
- `GET /relatorios/:id` - Buscar relatório
- `PUT /relatorios/:id` - Atualizar relatório
- `DELETE /relatorios/:id` - Deletar relatório

### Checklists (ADMIN only)

- `POST /checklists` - Criar checklist
- `GET /checklists` - Listar checklists
- `GET /checklists/:id` - Buscar checklist
- `PUT /checklists/:id` - Atualizar checklist
- `DELETE /checklists/:id` - Deletar checklist

Exemplo de payload:

```json
{
  "nome": "Checklist de visita",
  "descricao": "Checklist padrao para visitas tecnicas"
}
```

### Setores (ADMIN only)

- `POST /setores` - Criar setor
- `GET /setores` - Listar setores
- `GET /setores/:id` - Buscar setor
- `PUT /setores/:id` - Atualizar setor
- `DELETE /setores/:id` - Deletar setor

### Ramos de Atividade (ADMIN only)

- `POST /ramos` - Criar ramo
- `GET /ramos` - Listar ramos
- `GET /ramos/:id` - Buscar ramo
- `PUT /ramos/:id` - Atualizar ramo
- `DELETE /ramos/:id` - Deletar ramo

### Configurações

- `GET /configuracoes` - Listar configurações (qualquer autenticado)
- `PUT /configuracoes` - Atualizar configuração (ADMIN only)

## Configurações do Sistema

Para configurar horário de login permitido:

```json
{
  "dataInicio": "2026-02-12T08:00:00.000Z",
  "dataFim": "2026-02-12T18:00:00.000Z"
}
```

## Autenticação

Todas as rotas (exceto `/auth/login`) exigem token JWT no header:

```
Authorization: Bearer <token>
```

## Exemplo de Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "senha123"}'
```

Resposta:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "nome": "Administrador",
    "role": "ADMIN"
  }
}
```

## Criar Primeiro Usuário Admin

Após rodar as migrations, você pode criar um usuário admin diretamente no banco ou via seed script.

## Scripts Úteis

- `npm run dev` - Servidor em modo watch
- `npm run build` - Build para produção
- `npm run prisma:generate` - Gerar Prisma Client
- `npm run prisma:migrate` - Executar migrations
- `npx prisma studio` - Interface visual do banco

## Licença

ISC
