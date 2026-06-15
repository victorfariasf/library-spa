import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { NewsPage } from './news-page/news-page';
import { Login } from './login/login';
import { Register } from './register/register';
import { DashboardPage } from './dashboard/dashboard';
import { BooksPage } from './books/books';
import { UsersPage } from './usuarios/usuarios';
import { LoansPage } from './emprestimos/emprestimos';
import { HistoryPage } from './historico/historico';
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'dashboard', component: DashboardPage },
      { path: 'news', component: NewsPage },
      { path: 'livros', component: BooksPage },
      { path: 'usuarios', component: UsersPage },
      { path: 'emprestimos', component: LoansPage },
      { path: 'historico', component: HistoryPage },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
