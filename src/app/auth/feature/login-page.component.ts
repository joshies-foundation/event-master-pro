import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../data-access/auth.service';

@Component({
  selector: 'joshies-login-page',
  imports: [InputTextModule, ButtonModule, FormsModule],
  template: `
    <div class="flex-1 w-full text-5xl pr-12 pb-12 bounce-1">
      <span>🍄</span>
    </div>

    <form
      #form="ngForm"
      (ngSubmit)="signIn(form.value.username, form.value.password)"
      class="w-full max-w-[30rem] flex flex-col gap-4 px-4"
    >
      <!-- Username -->
      <input
        ngModel
        name="username"
        required
        pInputText
        type="text"
        placeholder="Username"
      />

      <!-- Password -->
      <input
        ngModel
        name="password"
        required
        pInputText
        type="password"
        placeholder="Password"
      />

      <!-- Log In Button -->
      <p-button
        styleClass="w-full"
        type="submit"
        [disabled]="!form.valid"
        label="Log In"
      />
    </form>

    <div class="flex-1 w-full text-5xl pr-12 pb-12 bounce-2">
      <span>🦷</span>
    </div>
  `,
  styles: `
    @keyframes moveX {
      from {
        left: 0;
      }
      to {
        left: 100%;
      }
    }

    @keyframes moveY {
      from {
        top: 0;
      }
      to {
        top: 100%;
      }
    }

    .bounce-1 {
      position: relative;

      span {
        animation-name: moveX, moveY;
        animation-duration: 4.3s, 1.8s;
        animation-iteration-count: infinite;
        animation-direction: alternate;
        animation-timing-function: linear;

        position: relative;
      }
    }

    .bounce-2 {
      position: relative;

      span {
        animation-name: moveX, moveY;
        animation-duration: 2.4s, 3.7s;
        animation-iteration-count: infinite;
        animation-direction: alternate-reverse, alternate;
        animation-timing-function: linear;

        position: relative;
      }
    }
  `,
  host: {
    class: 'h-full flex flex-col justify-center items-center',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginPageComponent {
  private readonly authService = inject(AuthService);

  signIn(username: string, password: string): void {
    this.authService.signIn(username, password);
  }
}
