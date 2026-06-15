# 🧪 Quick Test Checklist - Backend Integration

## ✅ Pre-Requisites

- [ ] Frontend rodando: `http://localhost:4200` ✅ (você já tem)
- [ ] Backend: Você precisa iniciar em `http://localhost:8000`
- [ ] DevTools aberto: F12 → Network tab (para ver requisições)

## 📍 Backend Setup (Primeira Vez)

```bash
# Terminal novo
cd ~/Documentos/Programming
git clone https://github.com/vitincmf/pf-biblioteca-fullstack- backend-repo

cd backend-repo/backend
python -m venv .venv
source .venv/bin/activate  # ou .venv\Scripts\activate (Windows)

pip install -r requirements.txt
cp .env.example .env
# Editar .env com DATABASE_URL do Supabase

python manage.py runserver
# Esperar: "Starting development server at http://127.0.0.1:8000/"
```

## 🎯 Test Scenarios

### Teste 1: Health Check

**Objetivo**: Validar comunicação básica backend ↔ frontend

```
1. DevTools → Network → XHR
2. Frontend (4200) → qualquer página
3. Verificar se há requisição GET /api/* no Network
4. ✅ Esperado: Status 200
❌ Se 0 (CORS) ou conection refused: Backend não está rodando
```

### Teste 2: Login com Mock

**Objetivo**: Testar mock fallback quando backend falhar

```
1. Parar backend (Ctrl+C no terminal Django)
2. Ir para http://localhost:4200/login
3. Email: admin@biblioteca.edu
4. Senha: admin123
5. ✅ Esperado: Redireciona para /dashboard (modo mock)
❌ Se não redireciona: Problema em mock login
```

### Teste 3: Login com Backend Real

**Objetivo**: Testar autenticação real

**Pré-requisito**: Você precisa ter um usuário no PostgreSQL

```sql
-- Execute no Supabase SQL Editor
INSERT INTO usuario (nome, email, endereco, status)
VALUES ('Teste User', 'teste@universidade.edu', 'Campus', 'ATIVO');
-- Nota: Senha precisa ser criada via endpoint /api/auth/register
-- Ou via backend admin
```

```
1. Iniciar backend: python manage.py runserver
2. DevTools → Network → filtrar /api
3. Ir para http://localhost:4200/login
4. Email: teste@universidade.edu (ou existente no DB)
5. Senha: senha configurada
6. ✅ Esperado:
   - Network: POST /api/auth/login → 200
   - Response: { usuario: { perfil, nome, email } }
   - Redirect para /dashboard
❌ Se 401 ou erro: Email/senha inválido
```

### Teste 4: Dashboard (Agregação de Dados)

**Objetivo**: Validar forkJoin de múltiplos endpoints

```
1. Estar logado (de teste 3)
2. Dashboard renderiza 4 cards:
   - Livros Disponíveis
   - Usuários Registrados
   - Empréstimos Ativos
   - Histórico Total
3. DevTools → Network: Deve aparecer
   - GET /api/livros
   - GET /api/alunos
   - GET /api/funcionarios
   - GET /api/emprestimos
   - GET /api/relatorios/historico
4. ✅ Esperado: Todos 200, cards preenchidos com números
❌ Se alguns 404: Falta dados backend ou endpoints diferentes
```

### Teste 5: Listar Livros

**Objetivo**: Testar GET /api/livros + search com debounce

```
1. Click Livros (menu lateral)
2. Deve aparecer lista de livros do backend
3. DevTools → Network: GET /api/livros → 200
4. Digite "clean" no search
5. Esperar 300ms (debounce)
6. DevTools: GET /api/livros?q=clean → 200
7. ✅ Esperado: Lista filtra por título
❌ Se 404 /api/livros: Backend não tem endpoint
❌ Se sem busca: QueryParams problema
```

### Teste 6: Criar Usuário (Aluno)

**Objetivo**: Testar POST /api/alunos com validação

```
1. Click Usuários (menu lateral)
2. Formulário aparece com:
   - Nome, Email, Endereço, Perfil (Aluno/Funcionário)
   - Se Aluno: Matrícula, Curso, Semestre
3. Preencher:
   - Nome: "Carlos Silva"
   - Email: "carlos@universidade.edu"
   - Endereço: "Campus Central"
   - Perfil: Aluno
   - Matrícula: "2024001"
   - Curso: "Engenharia"
   - Semestre: 3
4. Click Submit
5. DevTools → Network: POST /api/alunos → esperado 201
6. ✅ Esperado: Sucesso, confirmação na UI
❌ Se 400 (validação): Campos inválidos
❌ Se 409 (conflito): Email duplicado no DB
```

### Teste 7: Email Validation (Async)

**Objetivo**: Testar AsyncValidator

```
1. No form de Usuários
2. Email field: "admin@biblioteca.edu"
3. Esperar 250ms (delay do timer)
4. DevTools → Network: GET /api/auth/email-available?email=...
5. ✅ Esperado: Validação assíncrona marca como inválida
❌ Se passa validation: Async validator não rodou
```

### Teste 8: Criar Empréstimo (Validação de Datas)

**Objetivo**: Testar validação customizada (data_devolucao >= data_emprestimo)

```
1. Click Empréstimos
2. Formulário: Data Empréstimo, Data Devolução, etc.
3. Teste 1:
   - Data Empréstimo: 2026-06-20
   - Data Devolução: 2026-06-10 (ANTES)
   - ✅ Esperado: Erro "data_devolucao não pode ser anterior"
   - Submit desabilitado
4. Teste 2:
   - Data Empréstimo: 2026-06-20
   - Data Devolução: 2026-06-27 (DEPOIS)
   - ✅ Esperado: Formulário válido, Submit habilitado
5. Preencher resto e submit:
   - DevTools: POST /api/emprestimos → 201
❌ Se validação não funciona: returnDateValidator problema
```

### Teste 9: Histórico (Material Table)

**Objetivo**: Testar view + Material Data Table

```
1. Click Histórico
2. Tabela deve aparecer com colunas:
   - ID Empréstimo
   - Aluno
   - Funcionário
   - Livro
   - Data Empréstimo
   - Data Devolução
   - Status
3. Click em header para SORT
4. ✅ Esperado: Tabela ordena por coluna
5. Vai para página 2
   - ✅ Esperado: Paginação funciona (5 itens/página)
6. DevTools: GET /api/relatorios/historico/ → 200
```

### Teste 10: Fallback para Mock

**Objetivo**: Testar que mocks funcionam se backend cair

```
1. Estar em qualquer página com dados
2. Backend → Ctrl+C (parar)
3. Recarregar página (Ctrl+R)
4. ✅ Esperado: Dados mock aparecem (não erro)
5. DevTools: /api/* requisições mostram Network error
6. UI continua funcionando com dados de demonstração
❌ Se quebra UI: Fallback não implementado corretamente
```

## 📊 Network Tab Reference

### Boas Requisições (Status 200/201)

```
GET /api/livros                     → 200 ✅ [livros]
POST /api/auth/login               → 200 ✅ { usuario }
POST /api/alunos                   → 201 ✅ { aluno }
GET /api/relatorios/historico      → 200 ✅ [historico]
```

### Erros Esperados

```
GET /api/livros                     → 404 ❌ Endpoint não existe
POST /api/alunos (email duplicado) → 400 ❌ Validação falhou
GET /api/usuarios (não existe)     → 404 ❌ Use /alunos + /funcionarios
POST /api/emprestimos (data inv)   → 400 ❌ Backend valida
```

## 🐛 Debugging

### Se requisição não aparece no Network

```
1. DevTools → Console
2. Verificar erros de TypeScript
3. Componente está subscrito ao Observable?
   - Procurar por: this.apiService.listBooks().subscribe(...)
4. Se subscrição falta, dados não são fetchados
```

### Se resposta é 0 (CORS error)

```
1. Backend rodar em 8000: python manage.py runserver
2. OU usar proxy: Frontend reiniciar (npm start)
3. OU adicionar header CORS no backend (não precisa em dev)
```

### Se mock data aparece em vez de real

```
1. Backend respondeu? Network → Status 200/201?
2. Se não: Backend crashed, check terminal
3. Se sim: Observable.catchError() está retornando mock
4. Verificar transformação de resposta está correta
```

## 📝 Test Results Template

Copiar e preencher:

```
## Test Run - Date: ___________

### Backend Status
- Backend rodando? [ ] Sim [ ] Não
- URL: http://localhost:8000
- Database: [ ] Conectado [ ] Erro

### Frontend Status
- Frontend rodando? [ ] Sim [ ] Não
- URL: http://localhost:4200
- Proxy ativo? [ ] Sim [ ] Não

### Test Results

| Teste | Status | Nota |
|-------|--------|------|
| Health | [ ] ✅ [ ] ❌ | |
| Login Mock | [ ] ✅ [ ] ❌ | |
| Login Real | [ ] ✅ [ ] ❌ | |
| Dashboard | [ ] ✅ [ ] ❌ | |
| Livros | [ ] ✅ [ ] ❌ | |
| Criar Usuário | [ ] ✅ [ ] ❌ | |
| Email Validation | [ ] ✅ [ ] ❌ | |
| Criar Empréstimo | [ ] ✅ [ ] ❌ | |
| Histórico | [ ] ✅ [ ] ❌ | |
| Fallback Mock | [ ] ✅ [ ] ❌ | |

### Issues Found
- [ ] Nenhum
- [ ] ...

### Next Steps
- [ ] ...
```

---

## 🎓 Learning Path

Se algo falhar:

1. **Check Network Tab First** - 99% dos problemas visíveis ali
2. **Read Backend Response** - Backend retorna erro específico
3. **Console Errors** - JavaScript errors mostram no DevTools
4. **Check Services** - auth.service.ts e library-api.service.ts
5. **Verify Backend DB** - Dados existem no PostgreSQL?

---

**Good luck! 🚀**  
Se tiver dúvidas, todos os serviços têm fallback para mock, então UI continua funcionando!
