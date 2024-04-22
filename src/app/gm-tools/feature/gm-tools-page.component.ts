import { CardLinkModel } from '../../shared/ui/card-link.component';
import { CardComponent } from '../../shared/ui/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'joshies-gm-tools-pages-wrapper',
  standalone: true,
  imports: [CardComponent, PageHeaderComponent, RouterLink],
  template: `
    <joshies-page-header headerText="GM Tools" />
    <joshies-card headerText="Round" [links]="roundLinks" />
    <joshies-card headerText="Session" [links]="sessionLinks" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GmToolsPageComponent {
  readonly roundLinks: CardLinkModel[] = [
    {
      text: 'End Round & Tally Points',
      iconClass: 'pi pi-check-circle bg-green-500',
      routerLink: './end-round',
    },
  ];

  readonly sessionLinks: CardLinkModel[] = [
    {
      text: 'Disable or Enable Players',
      iconClass: 'pi pi-user-edit bg-orange-500',
      routerLink: './disable-players',
    },
    {
      text: 'End Session',
      iconClass: 'pi pi-stop-circle bg-red-500',
      routerLink: './end-session',
    },
  ];
}
