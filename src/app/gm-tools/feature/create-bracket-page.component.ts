import {
  ChangeDetectionStrategy,
  Component,
  WritableSignal,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TournamentBracketComponent } from '../../shared/ui/tournament-bracket.component';

@Component({
  selector: 'joshies-create-bracket-page',
  standalone: true,
  template: `
    <joshies-page-header headerText="Bracket Test Page" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>
    <div class="flex flex-column mt-5 font-semibold">
      <p class="mb-1">Event ID:</p>
      <p-inputNumber
        [(ngModel)]="eventIdLocal"
        [showButtons]="true"
        buttonLayout="horizontal"
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
        styleClass="w-full"
      />
      <p-button
        (onClick)="updateNumberOfTeams(eventIdLocal, eventId)"
        [label]="'Show Bracket for Event ' + eventIdLocal"
        styleClass="mt-3 w-full"
      />
    </div>
    <joshies-tournament-bracket [eventId]="eventId()" />
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    ButtonModule,
    FormsModule,
    InputNumberModule,
    TournamentBracketComponent,
  ],
})
export default class CreateBracketPageComponent {
  eventIdLocal = 8;
  eventId = signal(this.eventIdLocal);

  updateNumberOfTeams(
    newNumberOfTeams: number,
    numberOfTeamsSignal: WritableSignal<number>,
  ) {
    numberOfTeamsSignal.set(newNumberOfTeams);
  }
}
