import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LibraryApiService } from '../services/library-api.service';
import { HistoriaEmprestimo } from '../models/library.models';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './historico.html',
  styleUrl: './historico.sass',
})
export class HistoryPage implements AfterViewInit {
  private readonly libraryApi = inject(LibraryApiService);

  protected readonly columns = [
    'id_emprestimo',
    'aluno',
    'funcionario',
    'livro',
    'data_emprestimo',
    'data_devolucao',
    'status',
  ];
  protected readonly dataSource = new MatTableDataSource<HistoriaEmprestimo>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.libraryApi.listHistory().subscribe((history) => {
      this.dataSource.data = history;
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dataSource.filter = target.value.trim().toLowerCase();
  }
}
