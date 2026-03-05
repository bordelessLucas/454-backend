================================================================================
                    DOCUMENTAÇÃO DETALHADA - API 454
                 Request Body e Response Body de Cada Rota
                      (Total: 49 rotas disponíveis)
================================================================================

## 📌 AUTH - Autenticação

### 1. **POST /auth/login**
- **Requer Token:** NÃO
- **Requer Admin:** NÃO

#### REQUEST BODY:
```json
{
  "username": "string",
  "password": "string"
}
```

#### RESPONSE BODY (201):
```json
{
  "token": "string (JWT Token)",
  "user": {
    "id": "number",
    "username": "string",
    "nome": "string",
    "email": "string",
    "role": "ADMIN | TECNICO",
    "clienteId": "number | null",
    "ativo": "boolean"
  }
}
```

#### RESPONSE BODY (401):
```json
{
  "error": "string (mensagem de erro)"
}
```

---

## 📌 USERS - Gerenciamento de Usuários

### 1. **POST /users**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```json
{
  "username": "string",
  "password": "string",
  "nome": "string",
  "email": "string",
  "role": "ADMIN | TECNICO",
  "clienteId": "number (opcional)"
}
```

#### RESPONSE BODY (201):
```json
{
  "id": "number",
  "username": "string",
  "nome": "string",
  "email": "string",
  "role": "ADMIN | TECNICO",
  "clienteId": "number | null",
  "ativo": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

#### RESPONSE BODY (400):
```json
{
  "error": "string (mensagem de erro)"
}
```

---

### 2. **GET /users**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
[
  {
    "id": "number",
    "username": "string",
    "nome": "string",
    "email": "string",
    "role": "ADMIN | TECNICO",
    "clienteId": "number | null",
    "ativo": "boolean",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)"
  }
]
```

#### RESPONSE BODY (500):
```json
{
  "error": "Erro ao buscar usuários"
}
```

---

### 3. **GET /users/tecnico**
- **Requer Token:** SIM
- **Requer Admin:** NÃO
- **Nota:** Retorna apenas usuários com role TECNICO. Acessível por qualquer usuário autenticado.

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
[
  {
    "id": "number",
    "username": "string",
    "nome": "string",
    "email": "string",
    "role": "TECNICO",
    "clienteId": "number | null",
    "ativo": "boolean",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)"
  }
]
```

#### RESPONSE BODY (500):
```json
{
  "error": "Erro ao buscar técnicos"
}
```

---

### 4. **GET /users/:id**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "username": "string",
  "nome": "string",
  "email": "string",
  "role": "ADMIN | TECNICO",
  "clienteId": "number | null",
  "ativo": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

#### RESPONSE BODY (404):
```json
{
  "error": "Usuário não encontrado"
}
```

---

### 4. **PUT /users/:id**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```json
{
  "nome": "string (opcional)",
  "email": "string (opcional)",
  "role": "ADMIN | TECNICO (opcional)",
  "clienteId": "number | null (opcional)",
  "ativo": "boolean (opcional)"
}
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "username": "string",
  "nome": "string",
  "email": "string",
  "role": "ADMIN | TECNICO",
  "clienteId": "number | null",
  "ativo": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

### 5. **PUT /users/:id/password**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```json
{
  "newPassword": "string"
}
```

#### RESPONSE BODY (200):
```json
{
  "message": "Senha alterada com sucesso"
}
```

#### RESPONSE BODY (400):
```json
{
  "error": "Nova senha é obrigatória"
}
```

#### RESPONSE BODY (404):
```json
{
  "error": "Usuário não encontrado"
}
```

---

### 6. **DELETE /users/:id**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (204):
```
(vazio)
```

---

## 📌 CLIENTES - Gerenciamento de Clientes

### 1. **POST /clientes**
- **Requer Token:** SIM
- **Requer Admin:** NÃO
- **Nota:** Contato e Contrato são OBRIGATÓRIOS

#### REQUEST BODY:
```json
{
  "razaoSocial": "string",
  "nomeFantasia": "string",
  "cnpj": "string",
  "inscricaoEstadual": "string (opcional)",
  "endereco": "string",
  "cidade": "string",
  "estado": "string",
  "cep": "string",
  "telefone": "string (opcional)",
  "email": "string (opcional)",
  "ramoAtividadeId": "number",
  "contato": {
    "nome": "string",
    "cargo": "string (opcional)",
    "telefone": "string (opcional)",
    "email": "string (opcional)",
    "principal": "boolean (opcional, padrão: false)"
  },
  "contrato": {
    "numeroContrato": "string",
    "dataInicio": "string (ISO 8601)",
    "dataFim": "string (ISO 8601)",
    "valorMensal": "number",
    "descricaoServicos": "string",
    "condicoes": "string (opcional)"
  }
}
```

#### RESPONSE BODY (201):
```json
{
  "id": "number",
  "razaoSocial": "string",
  "nomeFantasia": "string",
  "cnpj": "string",
  "inscricaoEstadual": "string | null",
  "endereco": "string",
  "cidade": "string",
  "estado": "string",
  "cep": "string",
  "telefone": "string | null",
  "email": "string | null",
  "ramoAtividadeId": "number",
  "ativo": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "ramoAtividade": {
    "id": "number",
    "nome": "string"
  },
  "contatos": [
    {
      "id": "number",
      "clienteId": "number",
      "nome": "string",
      "cargo": "string | null",
      "telefone": "string | null",
      "email": "string | null",
      "principal": "boolean",
      "createdAt": "string (ISO 8601)",
      "updatedAt": "string (ISO 8601)"
    }
  ],
  "contratos": [
    {
      "id": "number",
      "clienteId": "number",
      "numeroContrato": "string",
      "dataInicio": "string (ISO 8601)",
      "dataFim": "string (ISO 8601)",
      "valorMensal": "number",
      "descricaoServicos": "string",
      "condicoes": "string | null",
      "ativo": "boolean",
      "createdAt": "string (ISO 8601)",
      "updatedAt": "string (ISO 8601)"
    }
  ]
}
```

---

### 2. **GET /clientes**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
[
  {
    "id": "number",
    "razaoSocial": "string",
    "nomeFantasia": "string",
    "cnpj": "string",
    "inscricaoEstadual": "string | null",
    "endereco": "string",
    "cidade": "string",
    "estado": "string",
    "cep": "string",
    "telefone": "string | null",
    "email": "string | null",
    "ramoAtividadeId": "number",
    "ativo": "boolean",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)",
    "ramoAtividade": {
      "id": "number",
      "nome": "string"
    },
    "contatos": [
      {
        "id": "number",
        "clienteId": "number",
        "nome": "string",
        "cargo": "string | null",
        "telefone": "string | null",
        "email": "string | null",
        "principal": "boolean",
        "createdAt": "string (ISO 8601)",
        "updatedAt": "string (ISO 8601)"
      }
    ],
    "contratos": [
      {
        "id": "number",
        "clienteId": "number",
        "numeroContrato": "string",
        "dataInicio": "string (ISO 8601)",
        "dataFim": "string (ISO 8601)",
        "valorMensal": "number",
        "descricaoServicos": "string",
        "condicoes": "string | null",
        "ativo": "boolean",
        "createdAt": "string (ISO 8601)",
        "updatedAt": "string (ISO 8601)"
      }
    ]
  }
]
```

---

### 3. **GET /clientes/:id**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "razaoSocial": "string",
  "nomeFantasia": "string",
  "cnpj": "string",
  "inscricaoEstadual": "string | null",
  "endereco": "string",
  "cidade": "string",
  "estado": "string",
  "cep": "string",
  "telefone": "string | null",
  "email": "string | null",
  "ramoAtividadeId": "number",
  "ativo": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "ramoAtividade": {
    "id": "number",
    "nome": "string"
  },
  "contatos": [
    {
      "id": "number",
      "clienteId": "number",
      "nome": "string",
      "cargo": "string | null",
      "telefone": "string | null",
      "email": "string | null",
      "principal": "boolean",
      "createdAt": "string (ISO 8601)",
      "updatedAt": "string (ISO 8601)"
    }
  ],
  "contratos": [
    {
      "id": "number",
      "clienteId": "number",
      "numeroContrato": "string",
      "dataInicio": "string (ISO 8601)",
      "dataFim": "string (ISO 8601)",
      "valorMensal": "number",
      "descricaoServicos": "string",
      "condicoes": "string | null",
      "ativo": "boolean",
      "createdAt": "string (ISO 8601)",
      "updatedAt": "string (ISO 8601)"
    }
  ]
}
```

#### RESPONSE BODY (404):
```json
{
  "error": "Cliente não encontrado"
}
```

---

### 4. **PUT /clientes/:id**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```json
{
  "razaoSocial": "string (opcional)",
  "nomeFantasia": "string (opcional)",
  "cnpj": "string (opcional)",
  "inscricaoEstadual": "string (opcional)",
  "endereco": "string (opcional)",
  "cidade": "string (opcional)",
  "estado": "string (opcional)",
  "cep": "string (opcional)",
  "telefone": "string (opcional)",
  "email": "string (opcional)",
  "ramoAtividadeId": "number (opcional)",
  "ativo": "boolean (opcional)",
  "contato": {
    "nome": "string (opcional)",
    "cargo": "string (opcional)",
    "telefone": "string (opcional)",
    "email": "string (opcional)",
    "principal": "boolean (opcional)"
  } (opcional),
  "contrato": {
    "numeroContrato": "string (opcional)",
    "dataInicio": "string (ISO 8601, opcional)",
    "dataFim": "string (ISO 8601, opcional)",
    "valorMensal": "number (opcional)",
    "descricaoServicos": "string (opcional)",
    "condicoes": "string (opcional)"
  } (opcional)
}
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "razaoSocial": "string",
  "nomeFantasia": "string",
  "cnpj": "string",
  "inscricaoEstadual": "string | null",
  "endereco": "string",
  "cidade": "string",
  "estado": "string",
  "cep": "string",
  "telefone": "string | null",
  "email": "string | null",
  "ramoAtividadeId": "number",
  "ativo": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "ramoAtividade": {
    "id": "number",
    "nome": "string"
  },
  "contatos": [
    {
      "id": "number",
      "clienteId": "number",
      "nome": "string",
      "cargo": "string | null",
      "telefone": "string | null",
      "email": "string | null",
      "principal": "boolean",
      "createdAt": "string (ISO 8601)",
      "updatedAt": "string (ISO 8601)"
    }
  ],
  "contratos": [
    {
      "id": "number",
      "clienteId": "number",
      "numeroContrato": "string",
      "dataInicio": "string (ISO 8601)",
      "dataFim": "string (ISO 8601)",
      "valorMensal": "number",
      "descricaoServicos": "string",
      "condicoes": "string | null",
      "ativo": "boolean",
      "createdAt": "string (ISO 8601)",
      "updatedAt": "string (ISO 8601)"
    }
  ]
}
```

---

### 5. **DELETE /clientes/:id**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (204):
```
(vazio)
```

---

### 6. **POST /clientes/:id/contatos**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```json
{
  "nome": "string",
  "cargo": "string (opcional)",
  "telefone": "string (opcional)",
  "email": "string (opcional)",
  "principal": "boolean (opcional, padrão: false)"
}
```

#### RESPONSE BODY (201):
```json
{
  "id": "number",
  "clienteId": "number",
  "nome": "string",
  "cargo": "string | null",
  "telefone": "string | null",
  "email": "string | null",
  "principal": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

### 7. **PUT /clientes/:id/contatos/:contatoId**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```json
{
  "nome": "string (opcional)",
  "cargo": "string (opcional)",
  "telefone": "string (opcional)",
  "email": "string (opcional)",
  "principal": "boolean (opcional)"
}
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "clienteId": "number",
  "nome": "string",
  "cargo": "string | null",
  "telefone": "string | null",
  "email": "string | null",
  "principal": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

### 8. **DELETE /clientes/:id/contatos/:contatoId**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (204):
```
(vazio)
```

---

## 📌 CHECKLISTS - Gerenciamento de Checklists

### 1. **POST /checklists**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```json
{
  "nome": "string",
  "descricao": "string (opcional)"
}
```

#### RESPONSE BODY (201):
```json
{
  "id": "number",
  "nome": "string",
  "descricao": "string | null",
  "ativo": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

### 2. **GET /checklists**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
[
  {
    "id": "number",
    "nome": "string",
    "descricao": "string | null",
    "ativo": "boolean",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)"
  }
]
```

---

### 3. **GET /checklists/:id**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "nome": "string",
  "descricao": "string | null",
  "ativo": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

#### RESPONSE BODY (404):
```json
{
  "error": "Checklist não encontrado"
}
```

---

### 4. **PUT /checklists/:id**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```json
{
  "nome": "string (opcional)",
  "descricao": "string (opcional)",
  "ativo": "boolean (opcional)"
}
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "nome": "string",
  "descricao": "string | null",
  "ativo": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

### 5. **DELETE /checklists/:id**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (204):
```
(vazio)
```

---

## 📌 CONFIGURAÇÕES - Gerenciamento de Configurações

### 1. **GET /configuracoes**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "dataInicio": "string (ISO 8601)",
  "dataFim": "string (ISO 8601)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

#### RESPONSE BODY (500):
```json
{
  "error": "Erro ao buscar configurações"
}
```

---

### 2. **PUT /configuracoes**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```json
{
  "dataInicio": "string (ISO 8601 ou formato de data)",
  "dataFim": "string (ISO 8601 ou formato de data)"
}
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "dataInicio": "string (ISO 8601)",
  "dataFim": "string (ISO 8601)",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

## 📌 RAMOS - Gerenciamento de Ramos de Atividade

### 1. **POST /ramos**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```json
{
  "nome": "string"
}
```

#### RESPONSE BODY (201):
```json
{
  "id": "number",
  "nome": "string",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

### 2. **GET /ramos**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
[
  {
    "id": "number",
    "nome": "string",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)"
  }
]
```

---

### 3. **GET /ramos/:id**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "nome": "string",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

#### RESPONSE BODY (404):
```json
{
  "error": "Ramo de atividade não encontrado"
}
```

---

### 4. **PUT /ramos/:id**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```json
{
  "nome": "string (opcional)"
}
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "nome": "string",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

### 5. **DELETE /ramos/:id**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (204):
```
(vazio)
```

---

## 📌 RELATÓRIOS - Gerenciamento de Relatórios

### 1. **POST /relatorios**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```json
{
  "clienteId": "number",
  "contatoId": "number (opcional)",
  "dataVisita": "string (ISO 8601)",
  "modalidadeServico": "Sem contrato - remoto | Sem contrato - local | Contrato - local | Contrato - remoto",
  "observacoes": "string (opcional)",
  "tecnicos": ["string"],
  "setores": [
    {
      "setorId": "number",
      "observacao": "string (opcional)"
    }
  ],
  "horarios": [
    {
      "horaChegada": "string (HH:mm ou ISO 8601)",
      "horaSaida": "string (HH:mm ou ISO 8601)"
    }
  ],
  "checklists": [
    {
      "checklistId": "number"
    }
  ]
}
```

#### RESPONSE BODY (201):
```json
{
  "id": "number",
  "clienteId": "number",
  "contatoId": "number | null",
  "criadoPorId": "number",
  "dataVisita": "string (ISO 8601)",
  "modalidadeServico": "Sem contrato - remoto | Sem contrato - local | Contrato - local | Contrato - remoto",
  "observacoes": "string | null",
  "impresso": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "cliente": {
    "id": "number",
    "razaoSocial": "string",
    "nomeFantasia": "string"
  },
  "contato": {
    "id": "number",
    "nome": "string"
  } | null,
  "criadoPor": {
    "id": "number",
    "nome": "string"
  },
  "tecnicos": [
    {
      "id": "number",
      "nome": "string"
    }
  ],
  "setores": [
    {
      "id": "number",
      "setorId": "number",
      "observacao": "string | null",
      "setor": {
        "id": "number",
        "nome": "string"
      }
    }
  ],
  "horarios": [
    {
      "id": "number",
      "horaChegada": "string (ISO 8601)",
      "horaSaida": "string (ISO 8601)"
    }
  ],
  "checklists": [
    {
      "id": "number",
      "checklistId": "number",
      "checklist": {
        "id": "number",
        "nome": "string"
      }
    }
  ]
}
```

---

### 2. **GET /relatorios**
- **Requer Token:** SIM
- **Requer Admin:** NÃO
- **Query Parameters:**
  - `clienteId` (number, opcional)
  - `criadoPorId` (number, opcional)
  - `dataInicio` (string ISO 8601, opcional)
  - `dataFim` (string ISO 8601, opcional)
  - `impresso` (boolean, opcional)

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
[
  {
    "id": "number",
    "clienteId": "number",
    "contatoId": "number | null",
    "criadoPorId": "number",
    "dataVisita": "string (ISO 8601)",
    "modalidadeServico": "Sem contrato - remoto | Sem contrato - local | Contrato - local | Contrato - remoto",
    "observacoes": "string | null",
    "impresso": "boolean",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)",
    "cliente": {
      "id": "number",
      "razaoSocial": "string",
      "nomeFantasia": "string"
    },
    "contato": {
      "id": "number",
      "nome": "string"
    } | null,
    "criadoPor": {
      "id": "number",
      "nome": "string"
    },
    "tecnicos": [
      {
        "id": "number",
        "nome": "string"
      }
    ],
    "setores": [
      {
        "id": "number",
        "setorId": "number",
        "observacao": "string | null",
        "setor": {
          "id": "number",
          "nome": "string"
        }
      }
    ],
    "horarios": [
      {
        "id": "number",
        "horaChegada": "string (ISO 8601)",
        "horaSaida": "string (ISO 8601)"
      }
    ],
    "checklists": [
      {
        "id": "number",
        "checklistId": "number",
        "checklist": {
          "id": "number",
          "nome": "string"
        }
      }
    ]
  }
]
```

---

### 3. **GET /relatorios/:id**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "clienteId": "number",
  "contatoId": "number | null",
  "criadoPorId": "number",
  "dataVisita": "string (ISO 8601)",
  "modalidadeServico": "Sem contrato - remoto | Sem contrato - local | Contrato - local | Contrato - remoto",
  "observacoes": "string | null",
  "impresso": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "cliente": {
    "id": "number",
    "razaoSocial": "string",
    "nomeFantasia": "string"
  },
  "contato": {
    "id": "number",
    "nome": "string"
  } | null,
  "criadoPor": {
    "id": "number",
    "nome": "string"
  },
  "tecnicos": [
    {
      "id": "number",
      "nome": "string"
    }
  ],
  "setores": [
    {
      "id": "number",
      "setorId": "number",
      "observacao": "string | null",
      "setor": {
        "id": "number",
        "nome": "string"
      }
    }
  ],
  "horarios": [
    {
      "id": "number",
      "horaChegada": "string (ISO 8601)",
      "horaSaida": "string (ISO 8601)"
    }
  ],
  "checklists": [
    {
      "id": "number",
      "checklistId": "number",
      "checklist": {
        "id": "number",
        "nome": "string"
      }
    }
  ]
}
```

#### RESPONSE BODY (404):
```json
{
  "error": "Relatório não encontrado"
}
```

---

### 4. **PUT /relatorios/:id**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```json
{
  "clienteId": "number (opcional)",
  "contatoId": "number (opcional)",
  "dataVisita": "string (ISO 8601, opcional)",
  "modalidadeServico": "Sem contrato - remoto | Sem contrato - local | Contrato - local | Contrato - remoto (opcional)",
  "observacoes": "string (opcional)",
  "impresso": "boolean (opcional)",
  "tecnicos": ["string"] (opcional),
  "setores": [
    {
      "setorId": "number",
      "observacao": "string (opcional)"
    }
  ] (opcional),
  "horarios": [
    {
      "horaChegada": "string (HH:mm ou ISO 8601)",
      "horaSaida": "string (HH:mm ou ISO 8601)"
    }
  ] (opcional),
  "checklists": [
    {
      "checklistId": "number"
    }
  ] (opcional)
}
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "clienteId": "number",
  "contatoId": "number | null",
  "criadoPorId": "number",
  "dataVisita": "string (ISO 8601)",
  "modalidadeServico": "Sem contrato - remoto | Sem contrato - local | Contrato - local | Contrato - remoto",
  "observacoes": "string | null",
  "impresso": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)",
  "cliente": {
    "id": "number",
    "razaoSocial": "string",
    "nomeFantasia": "string"
  },
  "contato": {
    "id": "number",
    "nome": "string"
  } | null,
  "criadoPor": {
    "id": "number",
    "nome": "string"
  },
  "tecnicos": [
    {
      "id": "number",
      "nome": "string"
    }
  ],
  "setores": [
    {
      "id": "number",
      "setorId": "number",
      "observacao": "string | null",
      "setor": {
        "id": "number",
        "nome": "string"
      }
    }
  ],
  "horarios": [
    {
      "id": "number",
      "horaChegada": "string (ISO 8601)",
      "horaSaida": "string (ISO 8601)"
    }
  ],
  "checklists": [
    {
      "id": "number",
      "checklistId": "number",
      "checklist": {
        "id": "number",
        "nome": "string"
      }
    }
  ]
}
```

---

### 5. **DELETE /relatorios/:id**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (204):
```
(vazio)
```

---

## 📌 SETORES - Gerenciamento de Setores

### 1. **POST /setores**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```json
{
  "nome": "string",
  "descricao": "string (opcional)"
}
```

#### RESPONSE BODY (201):
```json
{
  "id": "number",
  "nome": "string",
  "descricao": "string | null",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

### 2. **GET /setores**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
[
  {
    "id": "number",
    "nome": "string",
    "descricao": "string | null",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)"
  }
]
```

---

### 3. **GET /setores/:id**
- **Requer Token:** SIM
- **Requer Admin:** NÃO

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "nome": "string",
  "descricao": "string | null",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

#### RESPONSE BODY (404):
```json
{
  "error": "Setor não encontrado"
}
```

---

### 4. **PUT /setores/:id**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```json
{
  "nome": "string (opcional)",
  "descricao": "string (opcional)"
}
```

#### RESPONSE BODY (200):
```json
{
  "id": "number",
  "nome": "string",
  "descricao": "string | null",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

---

### 5. **DELETE /setores/:id**
- **Requer Token:** SIM
- **Requer Admin:** SIM

#### REQUEST BODY:
```
(vazio)
```

#### RESPONSE BODY (204):
```
(vazio)
```

---

## 📌 INFORMAÇÕES ADICIONAIS

### Padrões de Resposta

**Todas as datas retornam em formato ISO 8601:**
- Exemplo: `2026-02-19T10:30:45.123Z`

**Códigos de Status HTTP utilizados:**
- `201` - Criação bem-sucedida
- `200` - Sucesso (GET, PUT)
- `204` - Sucesso sem conteúdo (DELETE)
- `400` - Erro de validação
- `401` - Não autenticado
- `404` - Não encontrado
- `500` - Erro do servidor

### Headers Necessários

**Para rotas que requerem token:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Content-Type (para PUT/POST com corpo):**
```
Content-Type: application/json
```

### Notas Importantes

1. **Token JWT**: Obtido através do login (`POST /auth/login`)
2. **Valores nulos**: Campos marcados com `null` podem ser `null` ou omitidos
3. **Valores booleanos**: Use `true` ou `false` (não strings)
4. **Datas**: Use formato ISO 8601 ou deixe que a API faça a conversão
5. **IDs**: Sempre números inteiros
6. **Campos únicos**: `username`, `email` (user), `cnpj` (cliente), `nome` (ramo e checklist)

================================================================================
                            TOTAL: 49 ROTAS
================================================================================
