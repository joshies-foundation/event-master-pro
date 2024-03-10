import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FooterService {
  private readonly _footerDisabled = signal(false);

  readonly footerDisabled = this._footerDisabled.asReadonly();

  disableFooter(): void {
    this._footerDisabled.set(false);
  }

  enableFooter(): void {
    this._footerDisabled.set(true);
  }
}
