import { WritableSignal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { showMessageOnError } from './supabase-helpers';
import { showSuccessMessage } from './message-helpers';
import { ActivatedRoute, Router } from '@angular/router';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

export type ConfirmBackendActionConfig = {
  action: () => Promise<PostgrestSingleResponse<unknown>>;
  confirmationHeaderText?: string;
  confirmationMessageText?: string;
  confirmDialogKey?: string;
  icon?: string;
  successMessageText: string | null;
  submittingSignal: WritableSignal<boolean> | null;
  confirmationService: ConfirmationService;
  messageService: MessageService;
} & (
  | {
      successNavigation: string;
      router: Router;
      activatedRoute: ActivatedRoute;
    }
  | { successNavigation: null }
);

export async function confirmBackendAction(
  config: ConfirmBackendActionConfig,
): Promise<void> {
  config.confirmationService.confirm({
    header: config.confirmationHeaderText ?? 'Confirmation',
    message:
      config.confirmationMessageText ??
      'Are you sure you want to perform this action?',
    icon:
      config.icon ??
      (config.confirmDialogKey ? 'none' : 'pi pi-exclamation-triangle'),
    acceptIcon: 'none',
    rejectIcon: 'none',
    rejectButtonStyleClass: 'p-button-text',
    key: config.confirmDialogKey,
    accept: async () => {
      if (config.submittingSignal) {
        config.submittingSignal.set(true);
      }

      const { error } = await showMessageOnError(
        config.action(),
        config.messageService,
      );

      if (error) {
        if (config.submittingSignal) {
          config.submittingSignal.set(false);
        }
        return;
      }

      if (config.successMessageText) {
        showSuccessMessage(config.successMessageText, config.messageService);
      }

      if (config.successNavigation) {
        config.router.navigate([config.successNavigation], {
          relativeTo: config.activatedRoute,
        });
      }
    },
  });
}
