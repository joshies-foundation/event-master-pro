import { Pipe, PipeTransform } from '@angular/core';
import { DuelHistoryRecord, DuelModel } from '../../shared/util/supabase-types';

@Pipe({
  name: 'duelHistoryRecordToDuel',
  standalone: true,
})
export class DuelHistoryRecordToDuelPipe implements PipeTransform {
  transform(duelHistoryRecord: DuelHistoryRecord): DuelModel {
    return {
      id: duelHistoryRecord.id,
      challenger: {
        avatar_url: duelHistoryRecord.challenger_avatar_url,
        display_name: duelHistoryRecord.challenger_display_name,
      },
      opponent: {
        avatar_url: duelHistoryRecord.opponent_avatar_url,
        display_name: duelHistoryRecord.opponent_display_name,
      },
      status: duelHistoryRecord.status,
    } as DuelModel;
  }
}
