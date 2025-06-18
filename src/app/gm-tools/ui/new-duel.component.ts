import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CardComponent } from '../../shared/ui/card.component';
import { Select } from 'primeng/select';
import { AvatarModule } from 'primeng/avatar';
import { DecimalPipe } from '@angular/common';
import {
  PlayerService,
  PlayerWithUserAndRankInfo,
} from '../../shared/data-access/player.service';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { GameboardService } from '../../shared/data-access/gameboard.service';
import { GameboardSpaceModel } from '../../shared/util/supabase-types';
import { Button } from 'primeng/button';
import { DuelService } from '../../shared/data-access/duel.service';
import { confirmBackendAction } from '../../shared/util/dialog-helpers';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'joshies-new-duel',
  template: ` <div class="mt-4 flex flex-col gap-4">
    <joshies-card padded styleClass="flex flex-col gap-4">
      <label class="flex flex-col gap-2" [class.hidden]="challenger()">
        Challenger
        <p-select
          [options]="players()"
          [(ngModel)]="selectedChallenger"
          styleClass="flex"
          placeholder="Select a challenger"
        >
          <ng-template #item let-player>
            <div class="flex items-center gap-2">
              <p-avatar
                [image]="player.avatar_url"
                shape="circle"
                styleClass="h-6 w-6"
              />
              {{ player.display_name }} ({{ player.score | number }} points)
            </div>
          </ng-template>
          <ng-template #selectedItem let-player>
            <div class="flex items-center gap-2">
              <p-avatar
                [image]="player.avatar_url"
                shape="circle"
                styleClass="h-6 w-6"
              />
              {{ player.display_name }} ({{ player.score | number }} points)
            </div>
          </ng-template>
        </p-select>
      </label>
      <label class="flex flex-col gap-2">
        Opponent
        <p-select
          [options]="players()"
          [(ngModel)]="selectedOpponent"
          styleClass="flex"
          placeholder="Select an opponent"
        >
          <ng-template #item let-player>
            <div class="flex items-center gap-2">
              <p-avatar
                [image]="player.avatar_url"
                shape="circle"
                styleClass="h-6 w-6"
              />
              {{ player.display_name }} ({{ player.score | number }} points)
            </div>
          </ng-template>
          <ng-template #selectedItem let-player>
            <div class="flex items-center gap-2">
              <p-avatar
                [image]="player.avatar_url"
                shape="circle"
                styleClass="h-6 w-6"
              />
              {{ player.display_name }} ({{ player.score | number }} points)
            </div>
          </ng-template>
        </p-select>
      </label>
      <label
        class="flex flex-col gap-2"
        [class.hidden]="duelSpaces().length === 1"
      >
        Duel Space Type
        <p-select
          placeholder="Duel Spaces"
          [options]="duelSpaces()"
          optionLabel="name"
          [(ngModel)]="selectedDuelSpace"
        />
      </label>
    </joshies-card>
    <p-button
      label="Create Duel"
      styleClass="w-full mt-2"
      (onClick)="confirmSubmit()"
      [disabled]="submitButtonDisabled()"
      [loading]="submitting()"
    />
  </div>`,
  imports: [
    CardComponent,
    Select,
    AvatarModule,
    DecimalPipe,
    FormsModule,
    Button,
  ],
})
export default class NewDuelComponent implements OnInit {
  private readonly gameboardService = inject(GameboardService);
  private readonly playerService = inject(PlayerService);
  private readonly duelService = inject(DuelService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly challenger = input<PlayerWithUserAndRankInfo | null>(null);
  readonly inline = input<boolean>(false);

  readonly submitted = output<void>();

  readonly players = this.playerService.players;
  readonly selectedChallenger = signal<PlayerWithUserAndRankInfo | null>(null);
  readonly selectedOpponent = signal<PlayerWithUserAndRankInfo | null>(null);
  readonly selectedDuelSpace = signal<GameboardSpaceModel | null>(null);
  readonly submitting = signal(false);

  readonly submitButtonDisabled = computed(() => {
    const challenger = this.selectedChallenger();
    const opponent = this.selectedOpponent();
    const duelSpace = this.selectedDuelSpace();
    return (
      !challenger || !duelSpace || challenger.player_id === opponent?.player_id
    );
  });

  private readonly gameboardSpaces = toSignal(
    this.gameboardService.gameboardSpaces$,
  );

  readonly duelSpaces = computed(() => {
    const spaces = this.gameboardSpaces();
    return spaces?.filter((space) => space.effect === 'duel') || [];
  });

  confirmSubmit() {
    if (this.submitButtonDisabled()) {
      return;
    }

    const selectedChallenger = this.selectedChallenger();
    const selectedOpponent = this.selectedOpponent();
    const selectedDuelSpace = this.selectedDuelSpace();
    const inline = this.inline();

    const confirmationMessage = selectedOpponent
      ? `Are you sure you want to create a duel between ${selectedChallenger?.display_name} and ${selectedOpponent.display_name}?`
      : `Are you sure you want to create a duel for ${selectedChallenger?.display_name}?`;

    confirmBackendAction({
      action: async () => {
        this.submitted.emit();
        return this.duelService.createDuel(
          selectedChallenger!.player_id,
          selectedDuelSpace!.id,
          selectedOpponent?.player_id,
        );
      },
      confirmationMessageText: confirmationMessage,
      successMessageText: 'Duel created',
      submittingSignal: this.submitting,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
      successNavigation: inline ? '' : '..',
      activatedRoute: this.activatedRoute,
      router: this.router,
    });
  }

  ngOnInit(): void {
    const challenger = this.challenger();
    if (challenger) {
      this.selectedChallenger.set(challenger);
    }
  }

  constructor() {
    effect(() => {
      const duelSpaces = this.duelSpaces();
      if (duelSpaces && duelSpaces.length > 0) {
        this.selectedDuelSpace.set(duelSpaces[0]);
      }
    });
  }
}
