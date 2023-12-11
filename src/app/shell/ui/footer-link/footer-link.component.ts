import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';

export interface FooterLinkModel {
  href: string;
  text: string;
  iconClass: string;
}

@Component({
  selector: 'joshies-footer-link',
  standalone: true,
  imports: [RouterLink, NgClass, RouterLinkActive],
  templateUrl: './footer-link.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterLinkComponent {
  @Input({ required: true }) model!: FooterLinkModel;
}
