import {
  ChangeDetectionStrategy,
  Component,
  WritableSignal,
  computed,
  inject,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { TournamentBracketComponent } from '../../shared/ui/tournament-bracket.component';
import { EventService } from '../../shared/data-access/event.service';
import { DropdownModule } from 'primeng/dropdown';
import { EventModel } from '../../shared/util/supabase-types';

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
      @if (events()) {
        <p-dropdown
          [options]="events()!"
          [(ngModel)]="selectedEvent"
          optionLabel="id"
          placeholder="Select an Event"
          styleClass=" w-full"
        >
          <ng-template let-ev pTemplate="selectedItem">
            <div class="flex align-items-center gap-2">
              <div>{{ ev.name }}</div>
            </div>
          </ng-template>
          <ng-template let-ev pTemplate="item">
            <div class="flex align-items-center gap-2">
              <div>{{ ev.name }}</div>
            </div>
          </ng-template>
        </p-dropdown>
      }
    </div>
    <joshies-tournament-bracket [eventId]="selectedEvent.id!" />
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
    DropdownModule,
  ],
})
export default class CreateBracketPageComponent {
  private readonly eventService = inject(EventService);

  readonly events = computed(() => this.eventService.events());
  selectedEvent: Partial<EventModel> = {};

  updateNumberOfTeams(
    newNumberOfTeams: number,
    numberOfTeamsSignal: WritableSignal<number>,
  ) {
    numberOfTeamsSignal.set(newNumberOfTeams);
  }
}
