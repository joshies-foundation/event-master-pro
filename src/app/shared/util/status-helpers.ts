import { MessageService } from 'primeng/api';

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
