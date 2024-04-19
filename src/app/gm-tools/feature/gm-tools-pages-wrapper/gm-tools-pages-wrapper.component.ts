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

enum GmToolsPage {
  CreateSessionPage,
  ManageSessionPage,
  AccessDenied,
}

@Component({
  selector: 'joshies-gm-tools-pages-wrapper',
  standalone: true,
  imports: [
    CreateSessionPageComponent,
    ManageSessionPageComponent,
    SkeletonModule,
  ],
  templateUrl: './gm-tools-pages-wrapper.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GmToolsPagesWrapperComponent {
  private readonly sessionService = inject(SessionService);
  private readonly playerService = inject(PlayerService);

  readonly page = computed((): GmToolsPage | undefined => {
    // wait until data has finished loading
    if (
      this.sessionService.session() === undefined ||
      this.playerService.userIsGameMaster() === undefined
    ) {
      return;
    }

    // show create page when there is no active session
    if (this.sessionService.session() === null) {
      return GmToolsPage.CreateSessionPage;
    }

    // show manage page with user is game master
    if (this.playerService.userIsGameMaster()) {
      return GmToolsPage.ManageSessionPage;
    }

    // show access denied when neither of the above conditions are true (user is not GM of session)
    return GmToolsPage.AccessDenied;
  });

  protected readonly GmToolsPage = GmToolsPage;
}
