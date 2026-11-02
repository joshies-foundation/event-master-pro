import { computed, inject, Injectable, Signal } from '@angular/core';
import {
  isAuthRetryableFetchError,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  concat,
  distinctUntilChanged,
  EMPTY,
  from,
  map,
  Observable,
  of,
  shareReplay,
  tap,
} from 'rxjs';
import { Router } from '@angular/router';
import { showMessageOnError } from '../../shared/util/supabase-helpers';
import { MessageService } from '@openng/optimus-ui/api';
import { Database } from '../../shared/util/schema';
import {
  claimLiveRows,
  deleteOtherSchemaVersions,
  forgetLiveRows,
  liveRowsOwner,
} from '../../shared/util/live-rows-cache';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  private readonly savedUser = liveRowsOwner();

  readonly user$: Observable<User | undefined> = concat(
    this.savedUser ? of(this.savedUser) : EMPTY,
    from(this.supabase.auth.getSession()).pipe(
      map(
        ({ data, error }) =>
          data.session?.user ??
          (isAuthRetryableFetchError(error) ? this.savedUser : undefined),
      ),
      tap((user) => {
        if (this.savedUser && !user) void this.router.navigate(['/auth/login']);
      }),
    ),
    new Observable<User | undefined>((subscriber) => ({
      unsubscribe: this.supabase.auth.onAuthStateChange((event, session) => {
        // INITIAL_SESSION carries no session after a failed network refresh,
        // and that does not sign anyone out.
        if (session || event === 'SIGNED_OUT') subscriber.next(session?.user);
      }).data.subscription.unsubscribe,
    })),
  ).pipe(
    tap((user) => {
      if (user) claimLiveRows(user);
    }),
    distinctUntilChanged((a, b) => a?.id === b?.id),
    shareReplay(1),
  );

  readonly user: Signal<User | undefined> = toSignal(this.user$);

  readonly loginUsername: Signal<string | undefined> = computed(
    () => this.user()?.email?.split('@')[0],
  );

  constructor() {
    deleteOtherSchemaVersions();

    this.supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') forgetLiveRows();
    });
  }

  signIn(username: string, password: string): void {
    showMessageOnError(
      this.supabase.auth.signInWithPassword({
        email: username + '@joshies.app',
        password,
      }),
      this.messageService,
    ).then(({ error }) => {
      if (!error) {
        void this.router.navigate(['/']);
      }
    });
  }

  signOut(): void {
    showMessageOnError(this.supabase.auth.signOut(), this.messageService).then(
      ({ error }) => {
        if (!error) {
          void this.router.navigate(['/login']);
        }
      },
    );
  }
}
