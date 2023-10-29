import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'joshies-login-page',
  standalone: true,
  imports: [CommonModule, InputTextModule, ButtonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
  readonly form = new FormGroup({});
  onSubmit(event: Event): void {
    event.preventDefault();
    alert('Login successful');
  }
}
