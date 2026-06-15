import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { LibraryApiService } from '../services/library-api.service';

@Component({
  selector: 'app-loans-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './emprestimos.html',
  styleUrl: './emprestimos.sass',
})
export class LoansPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly libraryApi = inject(LibraryApiService);

  protected readonly form = this.fb.group(
    {
      alunoId: [1, Validators.required],
      funcionarioId: [1, Validators.required],
      livroId: [1, Validators.required],
      dataEmprestimo: ['', Validators.required],
      dataDevolucao: ['', Validators.required],
      multa: [0],
      observacao: [''],
    },
    { validators: [LoansPage.returnDateValidator] },
  );

  protected students: any[] = [];
  protected staff: any[] = [];
  protected books: any[] = [];
  protected message = '';

  ngOnInit(): void {
    this.libraryApi.listUsers().subscribe((users) => {
      this.students = users;
      this.staff = users;
    });
    this.libraryApi.listBooks().subscribe((books) => (this.books = books));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.libraryApi
      .createLoan({
        data_emprestimo: payload.dataEmprestimo ?? '',
        data_devolucao: payload.dataDevolucao ?? '',
        multa: payload.multa ?? 0,
        observacao: payload.observacao ?? '',
      })
      .subscribe(() => {
        this.message = 'Empréstimo preparado para integração com o backend.';
        this.form.reset({ alunoId: 1, funcionarioId: 1, livroId: 1, multa: 0 });
      });
  }

  private static returnDateValidator(control: AbstractControl): ValidationErrors | null {
    const loanDate = control.get('dataEmprestimo')?.value;
    const returnDate = control.get('dataDevolucao')?.value;

    if (!loanDate || !returnDate) {
      return null;
    }

    return new Date(returnDate) >= new Date(loanDate) ? null : { invalidReturnDate: true };
  }
}
