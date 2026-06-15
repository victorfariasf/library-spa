# 🔗 Guia de Integração com Backend - Sistema de Biblioteca

## Status Atual ✅

- **Frontend**: Angular 20.3 rodando em `http://localhost:4200`
- **Backend**: Django REST API esperado em `http://localhost:8000`
- **Integração**: Endpoints mapeados com fallback para mocks
- **Proxy**: Configurado para evitar CORS em desenvolvimento

---

## 1. Preparar o Backend

### Clonar e Configurar

```bash
cd ~/Documentos/Programming
git clone https://github.com/vitincmf/pf-biblioteca-fullstack- backend-repo
cd backend-repo/backend

# Criar ambiente virtual
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# ou
.venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com DATABASE_URL do Supabase
```

### Executar Backend

```bash
python manage.py runserver
# API disponível em: http://localhost:8000/api/
```

---

## 2. Iniciar Frontend com Proxy

```bash
cd ~/Documentos/Programming/libproject/library-spa

# Parar server anterior se estiver rodando (Ctrl+C)
npm start
# ou
npm run start

# Frontend disponível em: http://localhost:4200
# Proxy encaminhará /api/* para http://localhost:8000/api
```

---

## 3. Testar Endpoints

### Credenciais de Teste (Backend)

Para testar login, crie um usuário via backend primeiro ou use dados existentes no PostgreSQL.

### Fluxo de Teste Recomendado

1. **Login**
   - URL: `http://localhost:4200/login`
   - E-mail: (criar no backend primeiro)
   - Senha: (criar no backend primeiro)
   - ✅ Esperado: Redireciona para dashboard

2. **Dashboard**
   - Visualiza estatísticas em tempo real
   - ✅ Esperado: Mostra contagens de livros, usuários, empréstimos

3. **Livros**
   - Rota: `/dashboard/livros`
   - ✅ Esperado: Lista livros do backend com busca funcional

4. **Usuários**
   - Rota: `/dashboard/usuarios`
   - ✅ Esperado: Formário de criação com validação de email assíncrona

5. **Empréstimos**
   - Rota: `/dashboard/emprestimos`
   - ✅ Esperado: Criação com validação de datas

6. **Histórico**
   - Rota: `/dashboard/historico`
   - ✅ Esperado: Tabela Material com sort/paginação dos empréstimos

---

## 4. Endpoints Mapeados

| Endpoint                         | Método   | Função              | Status       |
| -------------------------------- | -------- | ------------------- | ------------ |
| `/api/auth/login`                | POST     | Login               | ✅ Conectado |
| `/api/auth/register`             | POST     | Registro            | ✅ Conectado |
| `/api/livros`                    | GET      | Listar livros       | ✅ Conectado |
| `/api/livros`                    | POST     | Criar livro         | ✅ Conectado |
| `/api/livros/<id>`               | PATCH    | Atualizar livro     | ✅ Pronto    |
| `/api/livros/<id>`               | DELETE   | Deletar livro       | ✅ Pronto    |
| `/api/alunos`                    | GET/POST | Alunos              | ✅ Conectado |
| `/api/funcionarios`              | GET/POST | Funcionários        | ✅ Conectado |
| `/api/emprestimos`               | GET/POST | Empréstimos         | ✅ Conectado |
| `/api/emprestimos/<id>/devolver` | POST     | Devolver empréstimo | ✅ Pronto    |
| `/api/relatorios/historico`      | GET      | Histórico           | ✅ Conectado |
| `/api/categorias`                | GET/POST | Categorias          | ✅ Conectado |

---

## 5. Troubleshooting

### Erro: "Failed to load resource - Cannot GET /api/..."

- ✅ **Solução**: Certifique-se de que:
  - Backend está rodando: `python manage.py runserver` em `localhost:8000`
  - Frontend foi reiniciado após editar `angular.json`: `npm start`
  - Proxy está ativo: verifique `proxy.conf.json` existe

### Erro: "CORS error"

- ✅ **Solução**: Backend tem CORS habilitado em `settings.py`
  - Em desenvolvimento: `CORS_ALLOW_ALL_ORIGINS = True`
  - Usar proxy deve evitar o problema

### Erro: "Email ou senha inválidos" no login

- ✅ **Solução**:
  - Confirme que você criou um usuário no backend
  - Verifique o status do usuário (deve ser 'ATIVO')
  - Confirme a senha cadastrada

### Componentes mostram dados de mock

- ✅ **Significado normal**: Se o backend não responder, componentes usam fallback de mock
- ✅ **Verificação**: Abra DevTools (F12) → Network → verifique requisições `/api/...`

---

## 6. Estrutura de Respostas

### Login Success (200)

```json
{
  "mensagem": "Login realizado com sucesso.",
  "usuario": {
    "id_usuario": 1,
    "nome": "João Silva",
    "email": "joao@universidade.edu",
    "endereco": "Campus Central",
    "status": "ATIVO",
    "perfil": "aluno"
  }
}
```

### Register Success (201)

```json
{
  "mensagem": "Usuario cadastrado com sucesso.",
  "usuario": {
    "id_usuario": 2,
    "nome": "Maria Santos",
    "email": "maria@universidade.edu",
    "status": "ATIVO"
  },
  "aluno": {
    "id_usuario": 2,
    "matricula": "2024001",
    "curso": "Engenharia",
    "semestre": 3
  }
}
```

### Histórico (GET /api/relatorios/historico/)

```json
[
  {
    "id_emprestimo": 1,
    "nome_aluno": "João Silva",
    "nome_funcionario": "Maria Oliveira",
    "titulo_livro": "Clean Code",
    "data_emprestimo": "2026-06-10",
    "data_devolucao": "2026-06-17",
    "status": "DEVOLVIDO"
  }
]
```

---

## 7. Próximos Passos

- [ ] Testar login com credenciais reais
- [ ] Validar criação de usuários (alunos/funcionários)
- [ ] Testar CRUD completo de empréstimos
- [ ] Implementar UI de Spartan/TailwindCSS (opcional)
- [ ] Deploy para produção com configuração correta de CORS

---

**Última atualização**: 2026-06-15
**Frontend**: Angular 20.3 + Material
**Backend**: Django 5.x + Django REST Framework
**Database**: PostgreSQL (Supabase)
