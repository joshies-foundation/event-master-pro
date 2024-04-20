import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SessionService } from '../../shared/data-access/session.service';
import { showErrorMessage } from '../../shared/util/error-helpers';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';
import { HeaderLinkComponent } from '../../shared/ui/header-link.component';

@Component({
  selector: 'joshies-end-session-page',
  standalone: true,
  imports: [PageHeaderComponent, HeaderLinkComponent, ButtonModule],
  template: `
    <joshies-page-header headerText="End Session" alwaysSmall>
      <joshies-header-link
        text="GM Tools"
        chevronDirection="left"
        routerLink=".."
      />
    </joshies-page-header>

    <p-button
      (onClick)="endSession()"
      label="End Session"
      severity="danger"
      styleClass="w-full"
      class="block mt-6 pt-6"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EndSessionPageComponent {
  private readonly sessionService = inject(SessionService);
  private readonly messageService = inject(MessageService);

  async endSession(): Promise<void> {
    const confirmationPassword = 'FUCK';
    const response = prompt(
      `End session? Type ${confirmationPassword} below to end this session.`,
    );

    if (response === confirmationPassword) {
      await this.sessionService.endSession();
    } else if (response !== null) {
      showErrorMessage(
        `You didn't enter ${confirmationPassword}, dummy`,
        this.messageService,
      );
    }
  }
}
