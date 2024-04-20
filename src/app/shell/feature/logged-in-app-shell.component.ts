import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../ui/footer.component';
import { FooterLinkModel } from '../ui/footer-link.component';
import { SessionService } from '../../shared/data-access/session.service';
import { PlayerService } from '../../shared/data-access/player.service';
import { FooterService } from '../../shared/data-access/footer.service';
import { NgClass } from '@angular/common';
import { pagePaddingXCssClass } from '../../shared/util/css-helpers';
import { layerPages } from '../../route-animations';

@Component({
  selector: 'joshies-logged-in-app-shell',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, NgClass],
  template: `
    <div [@routeAnimations]="prepareRoute(outlet)">
      <router-outlet #outlet="outlet" />
    </div>

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
  private readonly contexts = inject(ChildrenOutletContexts);

  readonly pagePaddingXCssClass = pagePaddingXCssClass;

  private readonly showGmToolsTab = computed(
    () =>
      this.sessionService.session() === null ||
      this.playerService.userIsGameMaster(),
  );

  readonly footerDisabled = this.footerService.footerDisabled;

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

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }
}
