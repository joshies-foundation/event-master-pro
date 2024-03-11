import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Input,
} from '@angular/core';
import { Tables } from '../../../shared/util/schema';
import { View } from '../../../shared/util/supabase-helpers';
import { DecimalPipe, NgClass, NgOptimizedImage } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { SharedModule } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { AuthService } from '../../../auth/data-access/auth.service';
import { PostgrestResponse } from '@supabase/supabase-js';

@Component({
  selector: 'joshies-analytics-lifetime-page',
  standalone: true,
  imports: [
    DecimalPipe,
    InputNumberModule,
    NgOptimizedImage,
    SharedModule,
    TableModule,
    NgClass,
  ],
  templateUrl: './analytics-lifetime-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AnalyticsLifetimePageComponent {
  @Input() readonly lifetimeResultsQueryResult!: PostgrestResponse<
    Tables<View.LifetimeUserStats>
  >; // route resolver param

  private readonly authService = inject(AuthService);

  readonly userId = computed(() => this.authService.user()?.id);
}
