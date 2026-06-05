import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.sass',
})
export class MainLayout {


  onLogout() {
    const username = window.localStorage.getItem('username');
    const password = window.localStorage.getItem('password');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex((u: any) => u.username === username && u.password === password);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      localStorage.setItem('users', JSON.stringify(users));
    }
    window.location.href = '/login';
  }
}
