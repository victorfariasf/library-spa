import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryApiService } from '../services/library-api.service';
import { forkJoin, map } from 'rxjs';
import { Emprestimo, HistoriaEmprestimo, Livro, Usuario } from '../models/library.models';

interface OverviewCard {
  title: string;
  value: number;
  description: string;
}

interface OverviewResponse {
  books: Livro[];
  users: Usuario[];
  loans: Emprestimo[];
  history: HistoriaEmprestimo[];
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.sass',
})
export class DashboardPage {
  private readonly libraryApi = inject(LibraryApiService);

  protected readonly overview$ = forkJoin({
    books: this.libraryApi.listBooks(),
    users: this.libraryApi.listUsers(),
    loans: this.libraryApi.listLoans(),
    history: this.libraryApi.listHistory(),
  }).pipe(
    map((response: OverviewResponse): OverviewCard[] => [
      {
        title: 'Livros disponíveis',
        value: response.books.length,
        description: 'Catálogo pronto para busca preditiva',
      },
      {
        title: 'Usuários cadastrados',
        value: response.users.length,
        description: 'Alunos e funcionários tipados',
      },
      {
        title: 'Empréstimos ativos',
        value: response.loans.length,
        description: 'Fluxo de devolução validado',
      },
      {
        title: 'Registros no histórico',
        value: response.history.length,
        description: 'Base para a view otimizada',
      },
    ]),
  );
}
