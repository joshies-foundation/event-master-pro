import { CardLinkModel } from '../../shared/ui/card-link.component';
import { CardComponent } from '../../shared/ui/card.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'joshies-gm-tools-pages-wrapper',
  standalone: true,
  imports: [CardComponent, PageHeaderComponent],
  template: `
    <joshies-page-header headerText="GM Tools" />
    <joshies-card headerText="Round" [links]="roundLinks" />
    <joshies-card headerText="Players" [links]="playersLinks" />
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

  readonly playersLinks: CardLinkModel[] = [
    {
      text: 'Override Points',
      iconClass: 'pi pi-sliders-h bg-purple-500',
      routerLink: './override-points',
    },
    {
      text: 'Disable or Enable Players',
      iconClass: 'pi pi-user-edit bg-orange-500',
      routerLink: './disable-players',
    },
    {
      text: 'Make Someone Else the GM',
      iconClass: 'pi pi-crown bg-yellow-500',
      routerLink: './change-gm',
    },
  ];

  readonly sessionLinks: CardLinkModel[] = [
    {
      text: 'End Session',
      iconClass: 'pi pi-stop-circle bg-red-500',
      routerLink: './end-session',
    },
  ];
}
