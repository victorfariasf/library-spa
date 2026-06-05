import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { NewsPage } from './news-page/news-page';
import { Login } from './login/login';
import { Register } from './register/register'
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'news', component: NewsPage },
      { path: '', redirectTo: 'news', pathMatch: 'full' },
    ]
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: '**',
    redirectTo: 'login'
  }
  
];