import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.sass',
})
export class Register {
 public login: string = '';
  public password: string = '';

  constructor(private router: Router) {}

  onSubmit() {
    const newUser = {
      username: this.login,
      password: this.password,
      role: 'user',
    };
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    this.router.navigate(['/login']);
  }
}
