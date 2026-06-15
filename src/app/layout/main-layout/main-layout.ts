import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.sass',
})
export class MainLayout {
  private readonly authService = inject(AuthService);

  protected readonly session = this.authService.session;
  protected readonly navigation = [
    { label: 'Dashboard', path: '/dashboard', icon: 'bi-speedometer2' },
    { label: 'Livros', path: '/livros', icon: 'bi-book' },
    { label: 'Usuários', path: '/usuarios', icon: 'bi-people' },
    { label: 'Empréstimos', path: '/emprestimos', icon: 'bi-arrow-left-right' },
    { label: 'Histórico', path: '/historico', icon: 'bi-clock-history' },
    { label: 'Notícias', path: '/news', icon: 'bi-newspaper' },
  ];

  protected readonly initials = computed(() => {
    const name = this.session()?.name ?? 'Biblioteca';
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  });

  onLogout() {
    this.authService.logout();
  }
}
