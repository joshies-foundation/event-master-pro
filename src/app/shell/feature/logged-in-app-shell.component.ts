import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from '../ui/footer/footer.component';
import { FooterLinkModel } from '../ui/footer-link/footer-link.component';
import { SessionService } from '../../shared/data-access/session.service';
import { PlayerService } from '../../shared/data-access/player.service';

@Component({
  selector: 'joshies-logged-in-app-shell',
  standalone: true,
  imports: [RouterOutlet, FooterComponent],
  template: `
    <main
      class="min-h-full px-3 pt-4 main-padding-bottom flex flex-column"
      style="padding-bottom: 6rem"
    >
      <router-outlet />
    </main>

    <joshies-footer [footerLinks]="footerLinks()" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoggedInAppShellComponent {
  private readonly sessionService = inject(SessionService);
  private readonly playerService = inject(PlayerService);

  private readonly showSessionTab = computed(
    () =>
      this.sessionService.session() === null ||
      this.playerService.userIsGameMaster(),
  );

  readonly footerLinks = computed((): FooterLinkModel[] => [
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
    ...(this.showSessionTab()
      ? [
          {
            text: 'Session',
            href: '/session',
            iconClass: 'pi pi-wrench',
          },
        ]
      : []),
    // {
    //   text: 'Notifications',
    //   href: '/notifications',
    //   iconClass: 'pi pi-bell',
    // },
    {
      text: 'Profile',
      href: '/profile',
      iconClass: 'pi pi-user',
    },
  ]);
}
