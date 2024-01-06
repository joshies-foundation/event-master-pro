import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../ui/footer/footer.component';
import { FooterLinkModel } from '../ui/footer-link/footer-link.component';

@Component({
  selector: 'joshies-logged-in-app-shell',
  standalone: true,
  imports: [RouterOutlet, FooterComponent],
  template: `
    <main class="min-h-full px-3 pt-4 main-padding-bottom flex flex-column">
      <router-outlet />
    </main>

    <joshies-footer [footerLinks]="footerLinks" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoggedInAppShellComponent {
  readonly footerLinks: FooterLinkModel[] = [
    {
      text: 'Rankings',
      href: '/rankings',
      iconClass: 'pi pi-star',
    },
    {
      text: 'Rules',
      href: '/rules',
      iconClass: 'pi pi-book',
    },
    {
      text: 'Notifications',
      href: '/notifications',
      iconClass: 'pi pi-bell',
    },
    {
      text: 'Profile',
      href: '/profile',
      iconClass: 'pi pi-user',
    },
  ];
}
