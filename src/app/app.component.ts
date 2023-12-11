import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'joshies-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ToastModule],
  template: `
    <router-outlet />
    <p-toast
      [breakpoints]="{ '420px': { width: '95vw' } }"
      position="top-center"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
