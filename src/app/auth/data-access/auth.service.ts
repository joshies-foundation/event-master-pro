import { computed, inject, Injectable, Signal } from '@angular/core';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  concat,
  distinctUntilChanged,
  from,
  map,
  Observable,
  shareReplay,
} from 'rxjs';
import { Router } from '@angular/router';
import { showMessageOnError } from '../../shared/util/supabase-helpers';
import { MessageService } from 'primeng/api';
import { Database } from '../../shared/util/schema';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabase: SupabaseClient<Database> = inject(SupabaseClient);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly user$: Observable<User | undefined> = concat(
    from(this.supabase.auth.getSession()).pipe(
      map((session) => session.data.session?.user),
    ),
    new Observable<User | undefined>((subscriber) => ({
      unsubscribe: this.supabase.auth.onAuthStateChange((event, session) =>
        subscriber.next(session?.user),
      ).data.subscription.unsubscribe,
    })),
  ).pipe(
    distinctUntilChanged((a, b) => a?.id === b?.id),
    shareReplay(1),
  );

  readonly user: Signal<User | undefined> = toSignal(this.user$);

  readonly loginUsername: Signal<string | undefined> = computed(
    () => this.user()?.email?.split('@')[0],
  );

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
