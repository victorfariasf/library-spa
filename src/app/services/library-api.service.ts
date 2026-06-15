import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, delay, map, Observable, of, tap } from 'rxjs';
import {
  Categoria,
  Emprestimo,
  HistoriaEmprestimo,
  Livro,
  Usuario,
} from '../models/library.models';

@Injectable({
  providedIn: 'root',
})
export class LibraryApiService {
  private readonly apiBaseUrl = '/api';

  private readonly mockBooks = signal<Livro[]>([
    {
      id_livro: 1,
      titulo: 'Clean Code',
      autor: 'Robert C. Martin',
      editora: 'Prentice Hall',
      ano_publicacao: 2008,
      id_categoria: 1,
    },
    {
      id_livro: 2,
      titulo: 'Angular na Prática',
      autor: 'Equipe Técnica',
      editora: 'TechPress',
      ano_publicacao: 2024,
      id_categoria: 2,
    },
    {
      id_livro: 3,
      titulo: 'Refactoring',
      autor: 'Martin Fowler',
      editora: 'Addison-Wesley',
      ano_publicacao: 2018,
      id_categoria: 1,
    },
  ]);

  private readonly mockUsers = signal<Usuario[]>([
    {
      id_usuario: 1,
      nome: 'Ana Souza',
      email: 'ana@universidade.edu',
      endereco: 'Campus Central',
      status: 'ATIVO',
    },
    {
      id_usuario: 2,
      nome: 'Bruno Lima',
      email: 'bruno@universidade.edu',
      endereco: 'Bloco B',
      status: 'ATIVO',
    },
  ]);

  private readonly mockLoans = signal<Emprestimo[]>([
    {
      id_emprestimo: 100,
      data_emprestimo: '2026-05-18',
      data_devolucao: '2026-05-25',
      multa: 0,
      observacao: 'Devolvido no prazo',
    },
    {
      id_emprestimo: 101,
      data_emprestimo: '2026-05-20',
      data_devolucao: '2026-05-27',
      multa: 2.5,
      observacao: 'Atraso de 1 dia',
    },
  ]);

  private readonly mockHistory = signal<HistoriaEmprestimo[]>([
    {
      id_emprestimo: 100,
      aluno: 'Ana Souza',
      funcionario: 'Maria Oliveira',
      livro: 'Clean Code',
      data_emprestimo: '2026-05-18',
      data_devolucao: '2026-05-25',
      status: 'Encerrado',
    },
    {
      id_emprestimo: 101,
      aluno: 'Bruno Lima',
      funcionario: 'Carlos Santos',
      livro: 'Refactoring',
      data_emprestimo: '2026-05-20',
      data_devolucao: '2026-05-27',
      status: 'Encerrado',
    },
    {
      id_emprestimo: 102,
      aluno: 'Carla Mendes',
      funcionario: 'Maria Oliveira',
      livro: 'Angular na Prática',
      data_emprestimo: '2026-06-05',
      data_devolucao: '2026-06-12',
      status: 'Em aberto',
    },
  ]);

  private readonly mockCategories = signal<Categoria[]>([
    {
      id_categoria: 1,
      nome: 'Engenharia de Software',
      descricao: 'Boas práticas, refatoração e qualidade',
      cor: '#b56f33',
    },
    {
      id_categoria: 2,
      nome: 'Frontend',
      descricao: 'Interfaces, UX e aplicações web',
      cor: '#3a7ca5',
    },
  ]);

  constructor(private http: HttpClient) {}

  searchBooks(term: string): Observable<Livro[]> {
    const params = new HttpParams().set('q', term);
    return this.http.get<Livro[]>(`${this.apiBaseUrl}/livros`, { params }).pipe(
      catchError(() => of(this.filterBooks(term))),
      tap((books) => {
        if (!books.length && term) {
          this.mockBooks.update((items) => items);
        }
      }),
    );
  }

  listBooks(): Observable<Livro[]> {
    return this.searchBooks('');
  }

  listUsers(): Observable<Usuario[]> {
    return this.http
      .get<Usuario[]>(`${this.apiBaseUrl}/alunos`)
      .pipe(
        catchError(() =>
          this.http
            .get<Usuario[]>(`${this.apiBaseUrl}/funcionarios`)
            .pipe(catchError(() => of(this.mockUsers()))),
        ),
      );
  }

  listLoans(): Observable<Emprestimo[]> {
    return this.http.get<Emprestimo[]>(`${this.apiBaseUrl}/emprestimos`).pipe(
      catchError(() => of(this.mockLoans())),
      delay(120),
    );
  }

  listHistory(): Observable<HistoriaEmprestimo[]> {
    return this.http.get<any[]>(`${this.apiBaseUrl}/relatorios/historico/`).pipe(
      map((items) =>
        items.map((item) => ({
          id_emprestimo: item.id_emprestimo,
          aluno: item.nome_aluno || 'N/A',
          funcionario: item.nome_funcionario || 'N/A',
          livro: item.titulo_livro || 'N/A',
          data_emprestimo: item.data_emprestimo,
          data_devolucao: item.data_devolucao,
          status: item.status || 'Em aberto',
        })),
      ),
      catchError(() => of(this.mockHistory())),
    );
  }

  listCategories(): Observable<Categoria[]> {
    return this.http
      .get<Categoria[]>(`${this.apiBaseUrl}/categorias`)
      .pipe(catchError(() => of(this.mockCategories())));
  }

  createLoan(payload: Partial<Emprestimo>): Observable<Emprestimo> {
    return this.http.post<Emprestimo>(`${this.apiBaseUrl}/emprestimos`, payload).pipe(
      tap((loan) => {
        this.mockLoans.update((items) => [loan, ...items]);
      }),
      catchError(() => {
        const loan: Emprestimo = {
          id_emprestimo: this.nextId(this.mockLoans().map((item) => item.id_emprestimo)),
          data_emprestimo: payload.data_emprestimo ?? new Date().toISOString().slice(0, 10),
          data_devolucao: payload.data_devolucao ?? new Date().toISOString().slice(0, 10),
          multa: payload.multa ?? 0,
          observacao: payload.observacao,
        };
        this.mockLoans.update((items) => [loan, ...items]);
        return of(loan).pipe(delay(150));
      }),
    );
  }

  createUser(payload: {
    nome: string;
    email: string;
    endereco: string;
    status: string;
  }): Observable<Usuario> {
    return this.http
      .post<Usuario>(`${this.apiBaseUrl}/alunos`, { ...payload, perfil: 'ALUNO' })
      .pipe(
        catchError(() => {
          const user: Usuario = {
            id_usuario: this.nextId(this.mockUsers().map((item) => item.id_usuario)),
            nome: payload.nome,
            email: payload.email,
            endereco: payload.endereco,
            status: payload.status === 'INATIVO' ? 'INATIVO' : 'ATIVO',
          };

          this.mockUsers.update((items) => [user, ...items]);
          return of(user).pipe(delay(150));
        }),
      );
  }

  private filterBooks(term: string): Livro[] {
    const normalizedTerm = term.trim().toLowerCase();
    if (!normalizedTerm) {
      return this.mockBooks();
    }

    return this.mockBooks().filter((book) => book.titulo.toLowerCase().includes(normalizedTerm));
  }

  private nextId(values: number[]): number {
    return values.length ? Math.max(...values) + 1 : 1;
  }
}
