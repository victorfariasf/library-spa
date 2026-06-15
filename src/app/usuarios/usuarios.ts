import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { catchError, map, of, switchMap, timer } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LibraryApiService } from '../services/library-api.service';
import { UserProfile } from '../models/library.models';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.sass',
})
export class UsersPage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly libraryApi = inject(LibraryApiService);

  protected readonly profiles: Array<{ label: string; value: UserProfile }> = [
    { label: 'Aluno', value: 'ALUNO' },
    { label: 'Funcionário', value: 'FUNCIONARIO' },
  ];

  protected readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email], [this.emailAvailableValidator()]],
    endereco: ['', [Validators.required, Validators.minLength(6)]],
    status: ['ATIVO', Validators.required],
    perfil: ['ALUNO' as UserProfile, Validators.required],
    matricula: [''],
    curso: [''],
    semestre: [1],
    observacao: [''],
    cargo: [''],
    setor: [''],
    salario: [0],
  });

  protected users: any[] = [];
  protected loading = true;
  protected message = '';

  ngOnInit(): void {
    this.setupDynamicValidators();
    this.libraryApi.listUsers().subscribe((users) => {
      this.users = users;
      this.loading = false;
    });
  }

  protected get isAluno(): boolean {
    return this.form.controls.perfil.value === 'ALUNO';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue();
    this.libraryApi
      .createUser({
        nome: payload.nome ?? '',
        email: payload.email ?? '',
        endereco: payload.endereco ?? '',
        status: payload.status ?? 'ATIVO',
      })
      .subscribe((user) => {
        this.users = [user, ...this.users];
        this.message = `Usuário ${payload.nome ?? ''} preparado para integração.`;
        this.form.reset({ perfil: 'ALUNO', status: 'ATIVO', semestre: 1, salario: 0 });
        this.setupDynamicValidators();
      });
  }

  protected setupDynamicValidators(): void {
    const perfil = this.form.controls.perfil.value;
    const alunoControls = [
      this.form.controls.matricula,
      this.form.controls.curso,
      this.form.controls.semestre,
      this.form.controls.observacao,
    ];
    const funcionarioControls = [
      this.form.controls.cargo,
      this.form.controls.setor,
      this.form.controls.salario,
    ];

    if (perfil === 'ALUNO') {
      alunoControls.forEach((control, index) => {
        control.setValidators(
          index === 2 ? [Validators.required, Validators.min(1)] : [Validators.required],
        );
        control.updateValueAndValidity({ emitEvent: false });
      });
      funcionarioControls.forEach((control) => {
        control.clearValidators();
        control.updateValueAndValidity({ emitEvent: false });
      });
    } else {
      funcionarioControls.forEach((control, index) => {
        control.setValidators(
          index === 2 ? [Validators.required, Validators.min(0)] : [Validators.required],
        );
        control.updateValueAndValidity({ emitEvent: false });
      });
      alunoControls.forEach((control) => {
        control.clearValidators();
        control.updateValueAndValidity({ emitEvent: false });
      });
    }
  }

  private emailAvailableValidator(): AsyncValidatorFn {
    return (control: AbstractControl) =>
      timer(250).pipe(
        switchMap(() => this.authService.checkEmailAvailable(control.value ?? '')),
        map((available) => (available ? null : { emailTaken: true })),
        catchError(() => of(null)),
      );
  }
}
