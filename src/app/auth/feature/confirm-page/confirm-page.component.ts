import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseClient } from '@supabase/supabase-js';

@Component({
  selector: 'joshies-confirm-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mt-3">
      {{ error() || 'Confirming...' }}
    </div>
  `,
  styles: ``,
})
export default class ConfirmPageComponent implements OnInit {
  private readonly supabase = inject(SupabaseClient);

  @Input() token_hash!: string;
  @Input() redirect_to?: string;

  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  async verify() {
    const token_hash = this.token_hash;
    const type = 'magiclink';
    const { error } = await this.supabase.auth.verifyOtp({
      token_hash,
      type,
    });
    if (error) {
      this.error.set(error.message + '; Redirecting in 5 seconds...');
      setTimeout(() => this.router.navigate(['/']), 5000);
    } else if (this.redirect_to) {
      this.router.navigate(['/' + this.redirect_to]);
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    if (!this.token_hash) {
      this.error.set('No token provided. Redirecting in 3 seconds...');
      setTimeout(() => this.router.navigate(['/']), 3000);
      return;
    }
    this.verify();
  }
}
