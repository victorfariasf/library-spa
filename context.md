# Project Context: Sistema de Biblioteca Full Stack

## 1. Visão Geral do Projeto

Este é o frontend de um Sistema de Gerenciamento de Biblioteca universitário. A infraestrutura de dados e a arquitetura lógica já estão validadas e em produção. O objetivo deste projeto frontend é consumir as APIs RESTful do sistema e fornecer uma interface limpa, responsiva e focada na experiência do usuário, mantendo o rigor das regras de negócio estabelecidas na modelagem relacional.

## 2. Tech Stack

- **Framework Core:** Angular (Última versão estável), TypeScript, RxJS.
- **Gerenciamento de Estado:** Signals (prioritário) ou RxJS `BehaviorSubject`.
- **Estilização e Componentes:** **Spartan UI** (`spartan-ng`) em conjunto com **TailwindCSS**.
- **Backend:** Python com Django (Django REST Framework).
- **Banco de Dados:** PostgreSQL hospedado no Supabase.

## 3. Estrutura de Dados e Interfaces TypeScript Esperadas

O banco de dados relacional (3FN) possui a seguinte estrutura central. A IA deve gerar as `Interfaces`/`Types` correspondentes no Angular com exatidão:

- **Usuario (Superclasse):** `id_usuario`, `nome`, `email`, `endereco`, `status` (default: 'ATIVO').
- **Aluno (Subclasse):** Herda de Usuario + `matricula`, `curso`, `semestre`, `observacao`.
- **Funcionario (Subclasse):** Herda de Usuario + `cargo`, `setor`, `salario`.
- **Unidade:** `id_unidade`, `nome`, `endereco`, `id_funcionario_gerente`.
- **Categoria:** `id_categoria`, `nome`, `descricao`, `cor`.
- **Livro:** `id_livro`, `titulo`, `autor`, `editora`, `ano_publicacao`, `id_categoria`.
- **Emprestimo (Entidade Associativa):** `id_emprestimo`, `data_emprestimo`, `data_devolucao`, `multa`, `observacao`.
- **Relacionamentos Pivot:**
  - `Realiza_Emprestimo`: Liga Aluno e Emprestimo.
  - `Registra_Item`: Relacionamento ternário ligando Funcionario, Emprestimo e Livro.

## 4. Regras de Negócio Críticas (Validações no Frontend)

Embora o banco de dados garanta a integridade via triggers PL/pgSQL, o Angular DEVE validar as regras abaixo utilizando `ReactiveForms` (com validações síncronas/assíncronas) antes do submit:

1. **Especialização Exclusiva (T, X):** No formulário de usuário, implementar um Radio Group (utilizando os primitivos do Spartan UI) para selecionar o perfil "Aluno" OU "Funcionário". A interface deve renderizar os campos adicionais dinamicamente. Um usuário não pode assumir ambos os papéis.
2. **Validação Temporal de Empréstimos:** A `data_devolucao` deve ser estritamente posterior ou igual à `data_emprestimo`. O formulário deve travar o botão de submit e exibir uma mensagem de erro estilizada caso a validação falhe.
3. **Consulta de Histórico Otimizada:** O backend expõe uma view (`vw_historico_emprestimos`). Criar um "Dashboard de Histórico" que consuma esse endpoint utilizando a Tabela de Dados do Spartan UI (Data Table), preferencialmente com paginação nativa e ordenação por data.

## 5. Diretrizes de Arquitetura Angular e Spartan UI

Para manter a coesão visual e arquitetural, a geração de código deve seguir estas diretrizes estritas:

- **Standalone Components:** Todo componente deve ser _standalone_. Não utilizar `NgModules`.
- **Spartan Primitives:** Ao invés de criar componentes HTML genéricos, DEVE-SE utilizar os pacotes `@spartan-ng/ui-*` (ex: `ui-button-helm`, `ui-input-helm`, `ui-card-helm`, `ui-table-helm`).
- **Diretivas `hlm`:** Aplicar as diretivas `hlm` fornecidas pelo Spartan UI nos elementos nativos para garantir que os estilos do Tailwind sejam processados com a consistência do design system (ex: `<input hlmInput />`, `<button hlmBtn>`).
- **Separação de Preocupações:**
  - **Smart Components:** Injetam os Services, gerenciam o estado via Signals/RxJS e passam dados.
  - **Dumb/UI Components:** Compostos estritamente pela montagem de blocos do Spartan UI, recebendo `@Input()` e emitindo `@Output()`.

## 6. Instruções Específicas de Comportamento para a IA

- **Geração de Componentes:** Sempre que solicitado a criar uma tela ou formulário, estruture o layout utilizando a tipografia, espaçamentos e componentes interativos (Dialogs, Toasts, Selects) do Spartan UI.
- **Integração HTTP:** Crie serviços isolados para os domínios (`AuthService`, `LivroService`, `EmprestimoService`) utilizando `HttpClient` ou a nova `fetch` API do Angular.
- **Busca Preditiva:** O banco de dados possui um índice `LOWER(titulo)` otimizado. Crie um campo de busca na listagem de livros (`<input hlmInput />`) acoplado a um `FormControl`. Utilize `valueChanges` com os operadores `debounceTime(300)` e `distinctUntilChanged()` do RxJS para disparar a busca na API sem causar gargalos.
- **Feedback Visual:** Envolva os estados de carregamento (loading), sucesso e erro das APIs utilizando os componentes de alerta e _toast_ (notificações) do ecossistema Spartan.
