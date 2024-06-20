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
import { pagePaddingXCssClass } from '../../shared/util/css-helpers';
import { layerPages } from '../../route-animations';
import { toSignal } from '@angular/core/rxjs-interop';
import { preventGlitchySwipeBackAnimation } from '../../shared/util/animation-helpers';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BetService } from '../../shared/data-access/bet.service';

@Component({
  selector: 'joshies-logged-in-app-shell',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, ConfirmDialogModule],
  template: `
    <!-- Pages -->
    <div [@routeAnimations]="pageAnimationLayer()" class="flex-1">
      <router-outlet />
    </div>

    <!-- Footer -->
    <joshies-footer
      [footerLinks]="footerLinks()"
      [disabled]="footerDisabled()"
    />

    <p-confirmDialog styleClass="mx-3" />
  `,
  animations: [layerPages],
  host: {
    class: 'h-full flex flex-column',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoggedInAppShellComponent {
  private readonly sessionService = inject(SessionService);
  private readonly playerService = inject(PlayerService);
  private readonly betService = inject(BetService);
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

  readonly footerLinks = computed((): FooterLinkModel[] => [
    {
      text: 'Home',
      href: '/home',
      iconClass: 'pi pi-home',
      iconClassFill: 'ci-home-fill',
    },
    {
      text: 'Rules',
      href: '/rules',
      iconClass: 'pi pi-book',
      iconClassFill: 'ci-book-fill',
    },
    ...(this.playerService.userPlayer()
      ? [
          {
            text: 'Betting',
            href: '/betting',
            hasBadge: this.betService.userHasBetRequests(),
            iconClass: 'pi pi-money-bill',
            iconClassFill: 'pi pi-money-bill', //TODO add fill class
          },
        ]
      : []),
    ...(this.playerService.userIsGameMaster()
      ? [
          {
            text: 'GM Tools',
            href: '/gm-tools',
            iconClass: 'pi pi-wrench',
            iconClassFill: 'ci-wrench-fill',
          },
        ]
      : []),
    {
      text: 'Analytics',
      href: '/analytics',
      iconClass: 'pi pi-chart-bar',
      iconClassFill: 'ci-chart-bar-fill',
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
      iconClassFill: 'ci-user-fill',
    },
  ]);
}
