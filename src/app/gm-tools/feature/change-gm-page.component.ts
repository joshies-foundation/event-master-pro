import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  signal,
} from '@angular/core';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { NgOptimizedImage } from '@angular/common';
import { UserService } from '../../shared/data-access/user.service';
import { GameStateService } from '../../shared/data-access/game-state.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserModel } from '../../shared/util/supabase-types';
import {
  showMessageOnError,
  trackById,
} from '../../shared/util/supabase-helpers';
import { showSuccessMessage } from '../../shared/util/message-helpers';
import { Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from '../../auth/data-access/auth.service';
import { StronglyTypedTableRowDirective } from '../../shared/ui/strongly-typed-table-row.directive';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'joshies-change-gm-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    TableModule,
    ButtonModule,
    NgOptimizedImage,
    SkeletonModule,
    ConfirmDialogModule,
    StronglyTypedTableRowDirective,
  ],
  template: `
    <!-- Header -->
    <joshies-page-header headerText="Change GM" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        chevronDirection="left"
        routerLink=".."
      />
    </joshies-page-header>

    <p class="mb-4 mt-8">Who do you want to be the new GM?</p>

    @if (users(); as users) {
      <p-table
        [value]="users"
        [defaultSortOrder]="-1"
        sortField="score"
        [sortOrder]="-1"
        [scrollable]="true"
        [rowTrackBy]="trackById"
      >
        <ng-template #body [joshiesStronglyTypedTableRow]="users" let-user>
          <tr>
            <!-- User -->
            <td>
              <div class="flex items-center gap-2 -py-2">
                <img
                  [ngSrc]="user.avatar_url"
                  alt=""
                  width="32"
                  height="32"
                  class="size-8 rounded-full bg-neutral-100"
                />
                <div>
                  <p>{{ user.display_name }}</p>
                  <p class="m-0 text-neutral-500 text-xs">
                    {{ user.real_name }}
                  </p>
                </div>
              </div>
            </td>
            <!-- Make GM Button -->
            <td class="text-right">
              <p-button
                label="Make GM"
                icon="pi pi-crown"
                [disabled]="submittingUserIdInProgress()"
                [loading]="submittingUserIdInProgress() === user.id"
                (onClick)="confirmChangeGameMaster(user)"
              />
            </td>
          </tr>
        </ng-template>
      </p-table>
    } @else {
      <p-skeleton height="30rem" styleClass="mt-8" />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChangeGmPageComponent {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly gameStateService = inject(GameStateService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  protected readonly trackById = trackById;

  readonly users: Signal<UserModel[] | undefined> = toSignal(
    this.userService.allUsersExceptCurrentUser$,
  );

  readonly submittingUserIdInProgress = signal<string | null>(null);

  confirmChangeGameMaster(newGmUser: UserModel): void {
    this.confirmationService.confirm({
      header: `Really? ${newGmUser.real_name}?`,
      message: `Are you sure you want to make ${newGmUser.real_name} the new GM? You will immediately lose all GM privileges.`,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        this.submittingUserIdInProgress.set(newGmUser.id);

        const { error } = await showMessageOnError(
          this.gameStateService.changeGameMaster(newGmUser.id),
          this.messageService,
        );

        if (error) {
          this.submittingUserIdInProgress.set(null);
          return;
        }

        showSuccessMessage(
          `${newGmUser.real_name} is the new GM`,
          this.messageService,
        );
        this.router.navigate(['/']);
      },
    });
  }
}
