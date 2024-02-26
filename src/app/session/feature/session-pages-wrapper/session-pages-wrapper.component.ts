import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { SessionService } from '../../../shared/data-access/session.service';
import { CreateSessionPageComponent } from '../create-session-page/create-session-page.component';
import { ManageSessionPageComponent } from '../manage-session-page/manage-session-page.component';
import { PlayerService } from '../../../shared/data-access/player.service';
import { SkeletonModule } from 'primeng/skeleton';

enum SessionPage {
  CreateSessionPage,
  ManageSessionPage,
  AccessDenied,
}

@Component({
  selector: 'joshies-session-pages-wrapper',
  standalone: true,
  imports: [
    CreateSessionPageComponent,
    ManageSessionPageComponent,
    SkeletonModule,
  ],
  templateUrl: './session-pages-wrapper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SessionPagesWrapperComponent {
  private readonly sessionService = inject(SessionService);
  private readonly playerService = inject(PlayerService);

  readonly page = computed((): SessionPage | undefined => {
    // wait until data has finished loading
    if (
      this.sessionService.session() === undefined ||
      this.playerService.userIsGameMaster() === undefined
    ) {
      return;
    }

    // show create page when there is no active session
    if (this.sessionService.session() === null) {
      return SessionPage.CreateSessionPage;
    }

    // show manage page with user is game master
    if (this.playerService.userIsGameMaster()) {
      return SessionPage.ManageSessionPage;
    }

    // show access denied when neither of the above conditions are true (user is not GM of session)
    return SessionPage.AccessDenied;
  });

  protected readonly SessionPage = SessionPage;
}
