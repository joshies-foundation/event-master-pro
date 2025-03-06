import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'joshies-confirm-page',
  imports: [],
  template: `{{ error() || 'Confirming...' }}`,
  host: {
    class: 'block mt-3',
  },
})
export default class ConfirmPageComponent implements OnInit {
  private readonly supabase = inject(SupabaseClient);
  private readonly router = inject(Router);

  readonly token_hash = input.required<string>();
  readonly redirect_to = input.required<string>();

  readonly error = signal<string | null>(null);

  async verify(): Promise<void> {
    const { error } = await this.supabase.auth.verifyOtp({
      token_hash: this.token_hash(),
      type: 'magiclink',
    });

    if (error) {
      this.error.set(error.message + '; Redirecting in 5 seconds...');
      setTimeout(() => this.router.navigate(['/']), 5000);
    } else if (this.redirect_to()) {
      void this.router.navigate(['/' + this.redirect_to()]);
    } else {
      void this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    if (!this.token_hash()) {
      this.error.set('No token provided. Redirecting in 3 seconds...');
      setTimeout(() => this.router.navigate(['/']), 3000);
      return;
    }
    this.verify();
  }
}
