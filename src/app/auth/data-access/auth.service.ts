import { inject, Injectable, Signal } from '@angular/core';
import { SupabaseClient, User } from '@supabase/supabase-js';
import { toSignal } from '@angular/core/rxjs-interop';
import { concat, from, map, Observable, shareReplay } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly supabase = inject(SupabaseClient);
  private readonly router = inject(Router);

  // we need user$ as an Observable for the auth guard to work
  readonly user$: Observable<User | undefined> = concat(
    from(this.supabase.auth.getSession()).pipe(
      map((session) => session.data.session?.user),
    ),
    new Observable<User | undefined>((subscriber) => ({
      unsubscribe: this.supabase.auth.onAuthStateChange((event, session) =>
        subscriber.next(session?.user),
      ).data.subscription.unsubscribe,
    })),
  ).pipe(shareReplay(1));

  readonly user: Signal<User | undefined> = toSignal(this.user$);

  async signIn(username: string, password: string): Promise<void> {
    try {
      await this.supabase.auth.signInWithPassword({
        email: username + '@joshies.app',
        password,
      });
      await this.router.navigate(['/']);
    } catch (err) {
      alert('Nope');
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.supabase.auth.signOut();
      await this.router.navigate(['/login']);
    } catch (err) {
      alert(err);
    }
  }
}
