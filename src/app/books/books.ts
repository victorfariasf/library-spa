import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, startWith, switchMap, takeUntil } from 'rxjs';
import { LibraryApiService } from '../services/library-api.service';

@Component({
  selector: 'app-books-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './books.html',
  styleUrl: './books.sass',
})
export class BooksPage implements OnInit, OnDestroy {
  private readonly libraryApi = inject(LibraryApiService);
  private readonly destroy$ = new Subject<void>();

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected books: any[] = [];
  protected loading = true;

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.libraryApi.searchBooks(term)),
        takeUntil(this.destroy$),
      )
      .subscribe((books) => {
        this.books = books;
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
