# 🔗 Mapeamento Técnico: Backend Django → Frontend Angular

## 📡 Visão Geral

```
┌─────────────────┐
│  Angular 4200   │
│   Components    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Services               │
│ - AuthService           │
│ - LibraryApiService     │
└────────┬────────────────┘
         │
         ▼ HTTP Requests
┌─────────────────────────┐
│  Dev Server (ng serve)  │
│  + Proxy Config         │
│  /api → 8000/api        │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Django Backend (8000)       │
│  - Views/APIViews            │
│  - Database: PostgreSQL      │
└──────────────────────────────┘
```

---

## 🔐 Autenticação

### Frontend: AuthService

```typescript
// POST /api/auth/login
login(payload: LoginPayload): Observable<AuthSession>
  ↓ HTTP POST
{ email: "user@uni.edu", senha: "senha123" }
  ↓
Esperado: 200 OK
{
  "mensagem": "Login realizado com sucesso.",
  "usuario": {
    "id_usuario": 1,
    "nome": "João Silva",
    "email": "joao@universidade.edu",
    "endereco": "Campus Central",
    "status": "ATIVO",
    "perfil": "aluno"  // ← Mapeia para roleLabel
  }
}
  ↓
Frontend parseia usuario.perfil → AuthSession.roleLabel
```

### Backend: AuthLoginView

```python
# core/views.py - AuthLoginView
- Busca usuário por email
- Valida senha (check_password)
- Obtém perfil (aluno/funcionario)
- Retorna 200 + usuario com perfil
```

---

## 📚 Gestão de Livros

### Frontend: LibraryApiService

```typescript
// GET /api/livros?q=term
searchBooks(term: string): Observable<Livro[]>
  ↓ HTTP GET
{ params: { q: "clean" } }
  ↓
Esperado: 200 OK
[
  {
    "id_livro": 1,
    "titulo": "Clean Code",
    "autor": "Robert C. Martin",
    "editora": "Prentice Hall",
    "ano_publicacao": 2008,
    "id_categoria": 1,
    "categoria": "Engenharia de Software"  // ← JOIN no backend
  }
]
```

### Backend: LivroListCreateView

```python
# GET: Queries com/sem 'q' parameter
SELECT l.*, c.nome AS categoria
FROM livro l
JOIN categoria c ON ...
WHERE LOWER(l.titulo) LIKE LOWER('%term%')
OR q='' para listar tudo
```

### POST /api/livros (Criar)

```typescript
createBook(payload: CreateLivroDTO): Observable<Livro>
  ↓ HTTP POST
{
  "titulo": "novo livro",
  "autor": "Autor",
  "editora": "Edit",
  "ano_publicacao": 2024,
  "id_categoria": 1
}
  ↓
Esperado: 201 CREATED
{ "id_livro": 10, ...criado }
```

---

## 👥 Gestão de Usuários (Alunos + Funcionários)

### Frontend: LibraryApiService

```typescript
// GET /api/alunos + GET /api/funcionarios
listUsers(): Observable<Usuario[]>
  ↓
Tenta GET /alunos primeiro
  ↓
Se falhar, tenta GET /funcionarios
  ↓
Se ambas falharem, retorna mock

// Resposta esperada:
[
  {
    "id_usuario": 1,
    "nome": "Ana Souza",
    "email": "ana@universidade.edu",
    "endereco": "Campus Central",
    "status": "ATIVO",
    "matricula": "2024001",      // ← Alunos
    "curso": "Engenharia",
    "semestre": 5,
    "observacao": "..."
  },
  {
    "id_usuario": 2,
    "nome": "Maria Oliveira",
    "email": "maria@universidade.edu",
    "status": "ATIVO",
    "cargo": "Bibliotecária",      // ← Funcionários
    "setor": "Acervo",
    "salario": 3500.00
  }
]
```

### Backend: AlunoListCreateView

```python
GET /api/alunos
SELECT u.id_usuario, u.nome, u.email, u.endereco, u.status,
       a.matricula, a.curso, a.semestre, a.observacao
FROM aluno a
JOIN usuario u ON u.id_usuario = a.id_usuario
```

### Backend: FuncionarioListCreateView

```python
GET /api/funcionarios
SELECT u.id_usuario, u.nome, u.email, u.endereco, u.status,
       f.cargo, f.setor, f.salario, f.observacao
FROM funcionario f
JOIN usuario u ON u.id_usuario = f.id_usuario
```

### POST /api/alunos (Criar Aluno)

```typescript
// Frontend components/usuarios/usuarios.ts
createUser(payload) ← com perfil='ALUNO'
  ↓ HTTP POST
{
  "nome": "Carlos Lima",
  "email": "carlos@universidade.edu",
  "endereco": "Bloco B",
  "status": "ATIVO",
  "matricula": "2024002",
  "curso": "Sistemas de Informação",
  "semestre": 3,
  "observacao": "novo aluno",
  "senha": "Senha@123"
}
  ↓
Esperado: 201 CREATED
{
  "mensagem": "Aluno cadastrado com sucesso.",
  "aluno": { ...inserido }
}
```

---

## 📋 Gestão de Empréstimos

### Frontend: LibraryApiService

```typescript
// GET /api/emprestimos
listLoans(): Observable<Emprestimo[]>
  ↓ HTTP GET
  ↓
Esperado: 200 OK
[
  {
    "id_emprestimo": 100,
    "data_emprestimo": "2026-06-10",
    "data_devolucao": "2026-06-17",
    "multa": 0,
    "observacao": "Empréstimo normal",
    "status": "ATIVO"
  }
]
```

### POST /api/emprestimos (Criar Empréstimo)

```typescript
createLoan(payload)
  ↓ HTTP POST
{
  "alunos": [1],              // Array com 1 aluno
  "livros": [1, 2, 3],        // Array com N livros
  "id_funcionario": 5,        // Quem registra
  "data_emprestimo": "2026-06-10",
  "data_devolucao": "2026-06-17",
  "multa": 0,
  "observacao": "Sem observações"
}
  ↓
Backend valida:
- Aluno ativo? Funcionário ativo?
- Livros existem? Estão disponíveis?
- data_devolucao >= data_emprestimo?
  ↓
Insere em 3 tabelas:
- emprestimo
- realiza_emprestimo (aluno + empréstimo)
- registra_item (livro + funcionário + empréstimo)
  ↓
Esperado: 201 CREATED
{
  "mensagem": "Emprestimo criado com sucesso.",
  "emprestimo": { "id_emprestimo": 100, ... },
  "alunos": [1],
  "livros": [1, 2, 3],
  "id_funcionario": 5
}
```

### POST /api/emprestimos/{id}/devolver (Devolver)

```typescript
// Future: não implementado em component ainda
POST /api/emprestimos/100/devolver
{
  "data_devolucao_real": "2026-06-20",  // opcional
  "multa": 5.50  // opcional - se não informado, calcula
}
  ↓
Backend:
- Valida se empréstimo existe
- Atualiza status para 'DEVOLVIDO'
- Calcula multa se necessário
  ↓
Esperado: 200 OK
{
  "mensagem": "Emprestimo devolvido com sucesso.",
  "id_emprestimo": 100,
  "status": "DEVOLVIDO",
  "data_devolucao_real": "2026-06-20",
  "multa": 5.50
}
```

---

## 📊 Relatórios & Histórico

### Frontend: LibraryApiService

```typescript
// GET /api/relatorios/historico/
listHistory(): Observable<HistoriaEmprestimo[]>
  ↓ HTTP GET
  ↓
Backend retorna dados da view vw_historico_emprestimos
  ↓
Esperado: 200 OK
[
  {
    "id_emprestimo": 100,
    "nome_aluno": "João Silva",        // ← Nomes from JOINs
    "nome_funcionario": "Maria Oliveira",
    "titulo_livro": "Clean Code",
    "data_emprestimo": "2026-06-10",
    "data_devolucao": "2026-06-17",
    "status": "DEVOLVIDO"
  }
]
  ↓
Frontend mapeia resposta:
- nome_aluno → aluno
- nome_funcionario → funcionario
- titulo_livro → livro
- Renderiza em Material DataTable
```

### Backend: HistoricoEmprestimosView

```python
SELECT *
FROM vw_historico_emprestimos
ORDER BY id_emprestimo, nome_aluno, titulo_livro
```

---

## 🏷️ Categorias

### GET /api/categorias

```typescript
// Frontend
listCategories(): Observable<Categoria[]>
  ↓
[
  {
    "id_categoria": 1,
    "nome": "Engenharia de Software",
    "descricao": "Boas práticas...",
    "cor": "#b56f33"
  }
]
```

### POST /api/categorias

```typescript
// Frontend (future)
{
  "nome": "Nova Categoria",
  "descricao": "Descrição",
  "cor": "#ffffff",
  "observacao": "nota interna"
}
  ↓
201 CREATED com categoria inserida
```

---

## 🔄 Transformações de Dados

| Campo Backend     | Frontend            | Transformação               |
| ----------------- | ------------------- | --------------------------- |
| `usuario.perfil`  | `session.roleLabel` | String direto               |
| `data_emprestimo` | `data_emprestimo`   | ISO 8601 (yyyy-MM-dd)       |
| `nome_aluno`      | `aluno`             | Renomeado na view historico |
| `titulo_livro`    | `livro`             | Renomeado na view historico |
| `status`          | `status`            | String direto               |

---

## ⚙️ Fluxo Completo: Criar Empréstimo

```
1. User clica "Criar Empréstimo" (component: emprestimos.ts)
   ↓
2. Form validation:
   - Data devolução >= data empréstimo (frontend)
   - Todos campos obrigatórios (frontend)
   ↓
3. Submit form → apiService.createLoan(payload)
   ↓
4. HTTP POST /api/emprestimos
   Payload: { alunos: [1], livros: [1,2], id_funcionario: 5, ... }
   ↓
5. Proxy intercepts: /api → http://localhost:8000/api
   ↓
6. Django recebe POST /api/emprestimos
   ↓
7. Backend validation:
   - Aluno e funcionário existem + ativos?
   - Livros existem?
   - Data válida? (trigger no DB)
   - Aluno tem empréstimo vencido?
   - Livros disponíveis nessa data?
   ↓
8. Se OK: Insert em 3 tabelas (emprestimo + realiza_emprestimo + registra_item)
   ↓
9. Response: 201 + { emprestimo, alunos, livros, id_funcionario }
   ↓
10. Frontend:
    - Observable completes
    - Component atualiza lista local
    - Material table renderiza
    - User vê novo empréstimo
```

---

## 🛡️ Tratamento de Erros

| Erro Backend       | Status | Frontend Response                           |
| ------------------ | ------ | ------------------------------------------- |
| Email duplicado    | 400    | Erro de integridade (UNIQUE constraint)     |
| Data inv válida    | 400    | `normalizar_data_iso` retorna erro          |
| Aluno inativo      | 409    | `erro_conflito`: "Aluno inativo..."         |
| Livro indisponível | 409    | `erro_conflito`: lista livros indisponíveis |
| Recurso não existe | 404    | Erro não encontrado                         |
| Senha fraca        | 400    | `validar_senha` retorna mensagem            |

---

## ✅ Checklist de Integração

- [x] URL base configurada (/api + proxy)
- [x] AuthService conectado (login/register)
- [x] LibraryApiService conectado (CRUD)
- [x] Endpoints mapeados (13 total)
- [x] Respostas parseadas corretamente
- [x] Fallbacks de mock implementados
- [x] Transformações de dados mapeadas
- [x] Proxy configurado (angular.json + proxy.conf.json)
- [x] Build sem erros
- [x] Dev server rodando
- [ ] Backend iniciado (pendente sua ação)
- [ ] Login testado com dados reais
- [ ] CRUD operações validadas

---

**Arquitetura**: Model-View-Service com RxJS observables  
**Padrão**: HttpClient + catchError com fallback  
**Proxy**: dev apenas (remover em prod)  
**Deploy**: Remover proxy, adicionar CORS reals no backend
