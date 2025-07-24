import { Pipe, PipeTransform } from '@angular/core';
import { DuelModel } from '../../shared/util/supabase-types';
import { DuelStatus } from '../../shared/util/supabase-helpers';

@Pipe({
  name: 'canCancelDuel',
  standalone: true,
})
export class CanCancelDuelPipe implements PipeTransform {
  transform(duel: DuelModel): boolean {
    return (
      duel.status === DuelStatus.OpponentNotSelected ||
      duel.status === DuelStatus.WagerNotSelected ||
      duel.status === DuelStatus.GameNotSelected ||
      duel.status === DuelStatus.WaitingToBegin
    );
  }
}
