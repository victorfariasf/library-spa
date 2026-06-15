import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, delay, EMPTY, map, Observable, of, tap } from 'rxjs';
import { AuthSession, LoginPayload, RegisterPayload } from '../models/library.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiBaseUrl = '/api';
  private readonly sessionKey = 'library-session';

  private readonly mockUsers = signal([
    {
      name: 'Admin Biblioteca',
      email: 'admin@biblioteca.edu',
      senha: 'admin123',
      roleLabel: 'Admin',
    },
  ]);

  readonly session = signal<AuthSession | null>(this.readSession());
  readonly loginError = signal('');
  readonly registerSuccess = signal('');

  constructor(private http: HttpClient) {}

  login(payload: LoginPayload): Observable<AuthSession> {
    this.loginError.set('');
    return this.http.post<any>(`${this.apiBaseUrl}/auth/login`, payload).pipe(
      tap((response) => {
        if (response?.usuario) {
          const session: AuthSession = {
            name: response.usuario.nome,
            email: response.usuario.email,
            roleLabel: response.usuario.perfil || 'Leitor',
          };
          this.persistSession(session);
        }
      }),
      map((response) => ({
        name: response?.usuario?.nome || '',
        email: response?.usuario?.email || '',
        roleLabel: response?.usuario?.perfil || 'Leitor',
      })),
      catchError(() => this.mockLogin(payload)),
    );
  }

  register(payload: RegisterPayload): Observable<AuthSession> {
    this.registerSuccess.set('');
    return this.http.post<any>(`${this.apiBaseUrl}/auth/register`, payload).pipe(
      tap((response) => {
        if (response?.usuario) {
          const session: AuthSession = {
            name: response.usuario.nome,
            email: response.usuario.email,
            roleLabel: response.usuario.perfil || 'Leitor',
          };
          this.persistSession(session);
          this.registerSuccess.set('Cadastro pronto para uso. Você já pode entrar.');
        }
      }),
      map((response) => ({
        name: response?.usuario?.nome || '',
        email: response?.usuario?.email || '',
        roleLabel: response?.usuario?.perfil || 'Leitor',
      })),
      catchError(() => this.mockRegister(payload)),
    );
  }

  logout(): void {
    this.session.set(null);
    localStorage.removeItem(this.sessionKey);
    window.location.href = '/login';
  }

  checkEmailAvailable(email: string): Observable<boolean> {
    return this.http
      .get<{ available: boolean }>(`${this.apiBaseUrl}/auth/email-available`, { params: { email } })
      .pipe(
        map((response) => response.available),
        catchError(() => of(!this.mockUsers().some((user) => user.email === email))),
      );
  }

  private mockLogin(payload: LoginPayload): Observable<AuthSession> {
    const user = this.mockUsers().find(
      (item) => item.email === payload.email && item.senha === payload.senha,
    );

    if (!user) {
      this.loginError.set('Credenciais inválidas.');
      return EMPTY;
    }

    const session: AuthSession = {
      name: user.name,
      email: user.email,
      roleLabel: user.roleLabel,
    };

    this.persistSession(session);
    return of(session).pipe(delay(150));
  }

  private mockRegister(payload: RegisterPayload): Observable<AuthSession> {
    const session: AuthSession = {
      name: payload.nome,
      email: payload.email,
      roleLabel: 'Leitor',
    };

    this.mockUsers.update((items) => [
      ...items,
      { name: payload.nome, email: payload.email, senha: payload.senha, roleLabel: 'Leitor' },
    ]);
    this.persistSession(session);
    this.registerSuccess.set('Cadastro pronto para uso. Você já pode entrar.');
    return of(session).pipe(delay(150));
  }

  private persistSession(session: AuthSession): void {
    this.session.set(session);
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  private readSession(): AuthSession | null {
    const raw = localStorage.getItem(this.sessionKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  }
}
