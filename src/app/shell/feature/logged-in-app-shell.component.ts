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
import { PlayerService } from '../../shared/data-access/player.service';
import { FooterService } from '../../shared/data-access/footer.service';
import { layerPages } from '../../route-animations';
import { toSignal } from '@angular/core/rxjs-interop';
import { preventGlitchySwipeBackAnimation } from '../../shared/util/animation-helpers';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BetService } from '../../shared/data-access/bet.service';
import { GameStateService } from '../../shared/data-access/game-state.service';

@Component({
  selector: 'joshies-logged-in-app-shell',
  imports: [RouterOutlet, FooterComponent, ConfirmDialogModule],
  template: `
    <!-- Pages -->
    <div [@routeAnimations]="pageAnimationLayer()" class="flex-1">
      <router-outlet />
    </div>

    @if (showFooter()) {
      <!-- Footer -->
      <joshies-footer
        [footerLinks]="footerLinks()"
        [disabled]="footerDisabled()"
      />
    }

    <p-confirmDialog styleClass="mx-4" />
  `,
  animations: [layerPages],
  host: {
    class: 'h-full flex flex-col',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoggedInAppShellComponent {
  private readonly gameStateService = inject(GameStateService);
  private readonly playerService = inject(PlayerService);
  private readonly betService = inject(BetService);
  private readonly footerService = inject(FooterService);
  private readonly router = inject(Router);

  readonly routerOutlet = viewChild.required(RouterOutlet);

  readonly footerDisabled = this.footerService.footerDisabled;

  readonly pageAnimationLayer: Signal<number | undefined> = toSignal(
    preventGlitchySwipeBackAnimation(
      this.router,
      this.routerOutlet,
      'pageAnimationLayer',
    ),
  );

  readonly showFooter = computed(
    () =>
      this.gameStateService.sessionIsInProgressOrFinished() ||
      this.playerService.userIsGameMaster(),
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
            badgeValue: this.betService.numBetRequests(),
            iconClass: 'pi pi-money-bill',
            iconClassFill: 'ci-money-bill-fill',
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
    {
      text: 'Profile',
      href: '/profile',
      iconClass: 'pi pi-user',
      iconClassFill: 'ci-user-fill',
    },
  ]);
}
