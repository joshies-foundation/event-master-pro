import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../auth/data-access/auth.service';

@Component({
  selector: 'joshies-logged-in-app-shell',
  standalone: true,
  imports: [RouterOutlet, ButtonModule],
  templateUrl: './logged-in-app-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoggedInAppShellComponent {
  private readonly authService = inject(AuthService);

  readonly user = this.authService.user;

  logOut(): void {
    this.authService.signOut();
  }
}
