import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseClient } from '@supabase/supabase-js';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'joshies-reset-password-page',
  imports: [InputTextModule, ButtonModule, ReactiveFormsModule],
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
      class="flex w-full max-w-[30rem] flex-col gap-4 px-4"
    >
      <input
        pInputText
        type="password"
        placeholder="New Password"
        [formControl]="form.controls.newPassword"
      />

      <input
        pInputText
        type="password"
        placeholder="Confirm New Password"
        [formControl]="form.controls.confirmNewPassword"
      />

      <p-button
        styleClass="w-full"
        type="submit"
        [disabled]="!form.valid"
        label="Reset Password"
      />

      @if (form.invalid) {
        @if (
          newPassword?.errors?.['minlength'] ||
          newPassword?.errors?.['maxlength']
        ) {
          <div>Password must be between 8 and 20 characters.</div>
        } @else if (form.errors?.['passwordsMustMatch']) {
          <div>Passwords do not match.</div>
        }
      }
    </form>
  `,
  host: {
    class: 'h-full flex flex-col justify-center items-center',
  },
})
export default class ResetPasswordPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly supabase = inject(SupabaseClient);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  readonly form = this.formBuilder.nonNullable.group(
    {
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
        ],
      ],
      confirmNewPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
        ],
      ],
    },
    { validators: [stringsMatchValidator] },
  );

  get newPassword() {
    return this.form.get('newPassword');
  }

  get confirmNewPassword() {
    return this.form.get('confirmNewPassword');
  }

  async onSubmit(): Promise<void> {
    const { newPassword } = this.form.getRawValue();

    const { error } = await this.supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      this.messageService.add({ detail: error.message, severity: 'error' });
    } else {
      this.messageService.add({
        detail: 'Password changed',
        severity: 'success',
      });
      this.router.navigate(['/']);
    }
  }
}

function stringsMatchValidator(c: AbstractControl): ValidationErrors | null {
  if (c.get('newPassword')?.value !== c.get('confirmNewPassword')?.value) {
    return { passwordsMustMatch: true };
  }
  return null;
}
