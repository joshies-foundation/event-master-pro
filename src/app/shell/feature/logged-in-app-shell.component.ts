import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../ui/footer.component';
import { FooterLinkModel } from '../ui/footer-link.component';
import { SessionService } from '../../shared/data-access/session.service';
import { PlayerService } from '../../shared/data-access/player.service';
import { FooterService } from '../../shared/data-access/footer.service';
import { JsonPipe, NgClass } from '@angular/common';
import { pagePaddingXCssClass } from '../../shared/util/css-helpers';
import { layerPages } from '../../route-animations';
import { toSignal } from '@angular/core/rxjs-interop';
import { preventGlitchySwipeBackAnimation } from '../../shared/util/animation-helpers';

@Component({
  selector: 'joshies-logged-in-app-shell',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, NgClass, JsonPipe],
  template: `
    <!-- Pages -->
    <div [@routeAnimations]="pageAnimationLayer()">
      <router-outlet />
    </div>

    <!-- Footer -->
    <joshies-footer
      [footerLinks]="footerLinks()"
      [disabled]="footerDisabled()"
    />
  `,
  animations: [layerPages],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoggedInAppShellComponent {
  private readonly sessionService = inject(SessionService);
  private readonly playerService = inject(PlayerService);
  private readonly footerService = inject(FooterService);
  private readonly router = inject(Router);

  readonly routerOutlet = viewChild.required(RouterOutlet);

  readonly pagePaddingXCssClass = pagePaddingXCssClass;

  readonly footerDisabled = this.footerService.footerDisabled;

  readonly pageAnimationLayer: Signal<number | undefined> = toSignal(
    preventGlitchySwipeBackAnimation(
      this.router,
      this.routerOutlet,
      'pageAnimationLayer',
    ),
  );

  private readonly showGmToolsTab = computed(
    () =>
      this.sessionService.session() === null ||
      this.playerService.userIsGameMaster(),
  );

  readonly footerLinks = computed((): FooterLinkModel[] => [
    {
      text: 'Home',
      href: '/home',
      iconClass: 'pi pi-home',
    },
    {
      text: 'Rules',
      href: '/rules',
      iconClass: 'pi pi-book',
    },
    ...(this.showGmToolsTab()
      ? [
          {
            text: 'GM Tools',
            href: '/gm-tools',
            iconClass: 'pi pi-wrench',
          },
        ]
      : []),
    {
      text: 'Analytics',
      href: '/analytics',
      iconClass: 'pi pi-chart-bar',
    },
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
