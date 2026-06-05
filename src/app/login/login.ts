import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.sass',
})
export class Login {

  public login: string = '';
  public password: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u: any) => u.username === this.login && u.password === this.password);
    if (!user) {
      alert('Login ou senha incorretos!');
      return;
    }
    console.log('Login efetuado com sucesso:', this.login);
    window.localStorage.setItem('username', this.login);
    window.localStorage.setItem('password', this.password);
    window.localStorage.setItem('role', user.role);
    this.router.navigate(['/news']);
  }

}
