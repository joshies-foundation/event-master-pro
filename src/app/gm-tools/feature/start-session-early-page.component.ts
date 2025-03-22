import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SessionService } from '../../shared/data-access/session.service';
import { showMessageOnError } from '../../shared/util/supabase-helpers';
import { showSuccessMessage } from '../../shared/util/message-helpers';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'joshies-start-session-early-page',
  imports: [
    PageHeaderComponent,
    HeaderLinkComponent,
    ButtonModule,
    ConfirmDialogModule,
  ],
  template: `
    <joshies-page-header headerText="Start Session Early" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        chevronDirection="left"
        routerLink=".."
      />
    </joshies-page-header>

    <p-button
      (onClick)="confirmStartSessionEarly()"
      [label]="'Start ' + sessionName() + ' Right Now'"
      styleClass="w-full"
      class="block mt-6 pt-6"
      [loading]="startingSession()"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StartSessionEarlyPageComponent {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly sessionService = inject(SessionService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly startingSession = signal(false);

  readonly sessionName = computed(
    () => this.sessionService.session()?.name ?? 'Session',
  );

  async confirmStartSessionEarly(): Promise<void> {
    this.confirmationService.confirm({
      header: 'Confirmation',
      message: `Are you sure you want to start ${this.sessionService.session()?.name} early? This will set the start date to now, and begin the session right away.`,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonStyleClass: 'p-button-text',
      accept: async () => {
        this.startingSession.set(true);

        const { error } = await showMessageOnError(
          this.sessionService.startSessionEarly(),
          this.messageService,
        );

        if (error) {
          this.startingSession.set(false);
          return;
        }

        showSuccessMessage('Session started!', this.messageService);
        this.router.navigate(['/']);
      },
    });
  }
}
