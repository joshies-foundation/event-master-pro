import { MessageService } from 'primeng/api';

export function showErrorMessage(
  message: string,
  messageService: MessageService,
): void {
  messageService.add({
    severity: 'error',
    summary: 'Error',
    detail: message,
  });
}

export function showSuccessMessage(
  message: string,
  messageService: MessageService,
): void {
  messageService.add({
    severity: 'success',
    summary: 'Success',
    detail: message,
  });
}
