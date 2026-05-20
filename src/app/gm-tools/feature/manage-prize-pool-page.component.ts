import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  ElementRef,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { SkeletonModule } from 'primeng/skeleton';
import { PlayerService } from '../../shared/data-access/player.service';
import { PrizeService } from '../../shared/data-access/prize.service';
import { SessionService } from '../../shared/data-access/session.service';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import {
  showMessageOnError,
  trackById,
} from '../../shared/util/supabase-helpers';
import { PrizeModel } from '../../shared/util/supabase-types';
import { CardComponent } from '../../shared/ui/card.component';

@Component({
  selector: 'joshies-manage-prize-pool-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    ButtonModule,
    SkeletonModule,
    FormsModule,
    ToggleSwitch,
    ConfirmDialogModule,
    NgOptimizedImage,
    CardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
  template: `
    <joshies-page-header headerText="Manage Prize Pool" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        routerLink=".."
        chevronDirection="left"
      />
    </joshies-page-header>

    <!-- Prize Settings (inline) -->
    <joshies-card padded class="mt-6">
      <h2 class="mb-3 text-base font-semibold">Prize Settings</h2>
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="font-medium">Award token to event winners</p>
          <p class="text-sm text-neutral-500">
            Automatically give a prize token to every player on the 1st place
            team when a round ends.
          </p>
        </div>
        <p-toggleswitch
          class="shrink-0"
          [ngModel]="autoMint()"
          (ngModelChange)="onToggleAutoMint($event)"
          [disabled]="!session()"
        />
      </div>
    </joshies-card>

    <!-- Upload -->
    <joshies-card padded class="mt-6">
      <h2 class="mb-1 text-base font-semibold">Add Prizes</h2>
      <p class="mb-3 text-sm text-neutral-500">
        Square images look best. Each image becomes one un-won prize in the
        pool.
      </p>
      <input
        #fileInput
        type="file"
        accept="image/*"
        multiple
        class="hidden"
        (change)="onFilesSelected($event)"
      />
      <p-button
        label="Choose Images"
        icon="pi pi-upload"
        [disabled]="!session() || uploading()"
        [loading]="uploading()"
        (onClick)="fileInput.click()"
      />
      @if (uploadStatus(); as status) {
        <p class="mt-3 text-sm">{{ status }}</p>
      }
    </joshies-card>

    <!-- Un-won prizes -->
    <section class="mt-6">
      <h2 class="mb-2 px-1 text-base font-semibold">
        Un-Won Prizes ({{ unwonPrizes()?.length ?? 0 }})
      </h2>
      @if (prizeService.prizes()) {
        @if (unwonPrizes()?.length) {
          <div class="grid grid-cols-3 gap-2 sm:grid-cols-4">
            @for (prize of unwonPrizes(); track trackById($index, prize)) {
              <div class="relative aspect-square overflow-hidden rounded-lg">
                <img
                  [src]="prize.image_url"
                  alt="Prize"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
                <button
                  type="button"
                  class="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow"
                  [disabled]="deletingId() === prize.id"
                  (click)="confirmDelete(prize)"
                  aria-label="Delete prize"
                >
                  <i class="pi pi-trash text-xs"></i>
                </button>
              </div>
            }
          </div>
        } @else {
          <p class="py-4 text-center text-sm text-neutral-500">
            No un-won prizes. Upload some images above.
          </p>
        }
      } @else {
        <p-skeleton height="8rem" />
      }
    </section>

    <!-- Won prizes -->
    <section class="mt-8 pb-12">
      <h2 class="mb-2 px-1 text-base font-semibold">
        Won Prizes ({{ wonPrizes()?.length ?? 0 }})
      </h2>
      @if (wonPrizes()?.length) {
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
          @for (prize of wonPrizes(); track trackById($index, prize)) {
            <joshies-card class="overflow-clip p-2">
              <div class="aspect-square">
                <img
                  [src]="prize.image_url"
                  alt="Prize"
                  class="h-full w-full rounded-t-xl object-cover"
                  loading="lazy"
                />
              </div>
              <div class="flex items-center gap-2 p-2 text-xs">
                @if (ownerOf(prize); as owner) {
                  <img
                    [ngSrc]="owner.avatar_url"
                    width="24"
                    height="24"
                    class="size-6 rounded-full bg-neutral-100"
                    alt=""
                  />
                  <span class="truncate">{{ owner.display_name }}</span>
                } @else {
                  <span class="text-neutral-400">Unknown owner</span>
                }
              </div>
            </joshies-card>
          }
        </div>
      } @else {
        <p class="py-4 text-center text-sm text-neutral-500">
          No prizes have been won yet.
        </p>
      }
    </section>

    <p-confirm-dialog styleClass="mx-4" />
  `,
})
export default class ManagePrizePoolPageComponent {
  protected readonly prizeService = inject(PrizeService);
  private readonly sessionService = inject(SessionService);
  private readonly playerService = inject(PlayerService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly fileInput =
    viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected readonly trackById = trackById;
  protected readonly session = this.sessionService.session;
  protected readonly autoMint = computed(
    () => this.session()?.prize_token_on_event_win ?? true,
  );

  protected readonly unwonPrizes = computed(() =>
    this.prizeService.prizes()?.filter((p) => p.won_by_player_id === null),
  );
  protected readonly wonPrizes = computed(() =>
    this.prizeService.prizes()?.filter((p) => p.won_by_player_id !== null),
  );

  protected readonly uploading = signal(false);
  protected readonly uploadStatus = signal<string | null>(null);
  protected readonly deletingId = signal<number | null>(null);

  protected ownerOf(prize: PrizeModel) {
    return this.playerService
      .playersIncludingDisabled()
      ?.find((p) => p.player_id === prize.won_by_player_id);
  }

  protected async onToggleAutoMint(enabled: boolean): Promise<void> {
    const sessionId = this.session()?.id;
    if (!sessionId) return;
    await showMessageOnError(
      this.prizeService.setAutoMint(sessionId, enabled),
      this.messageService,
    );
  }

  protected async onFilesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    const sessionId = this.session()?.id;
    if (!sessionId || !files.length) return;

    this.uploading.set(true);
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      this.uploadStatus.set(`Uploading ${i + 1} of ${files.length}...`);
      const result = await this.prizeService.uploadPrize(sessionId, files[i]);
      if (result && !result.error) {
        successCount++;
      } else {
        failCount++;
      }
    }

    this.uploading.set(false);
    this.uploadStatus.set(
      `Uploaded ${successCount}${failCount ? `, ${failCount} failed` : ''}.`,
    );

    this.fileInput().nativeElement.value = '';
  }

  protected confirmDelete(prize: PrizeModel): void {
    this.confirmationService.confirm({
      message: 'Permanently delete this un-won prize?',
      header: 'Delete Prize',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger' },
      accept: () => this.doDelete(prize),
    });
  }

  private async doDelete(prize: PrizeModel): Promise<void> {
    this.deletingId.set(prize.id);
    await showMessageOnError(
      this.prizeService.deletePrize(prize),
      this.messageService,
    );
    this.deletingId.set(null);
  }
}
