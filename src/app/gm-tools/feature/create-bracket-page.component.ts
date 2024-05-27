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
    <div class="flex justify-content-between mt-5">
      <p-inputNumber
        [(ngModel)]="numberOfTeamsLocal"
        [showButtons]="true"
        buttonLayout="horizontal"
        incrementButtonIcon="pi pi-plus"
        decrementButtonIcon="pi pi-minus"
      />
      <p-button
        (onClick)="updateNumberOfTeams(numberOfTeamsLocal, this.numberOfTeams)"
        label="Go"
        styleClass="h-full"
      />
    </div>
    <joshies-tournament-bracket
      [numberOfTeams]="numberOfTeams()"
      [eventId]="8"
    />
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
  numberOfTeamsLocal = 10;
  numberOfTeams = signal(this.numberOfTeamsLocal);

  updateNumberOfTeams(
    newNumberOfTeams: number,
    numberOfTeamsSignal: WritableSignal<number>,
  ) {
    numberOfTeamsSignal.set(newNumberOfTeams);
  }
}
