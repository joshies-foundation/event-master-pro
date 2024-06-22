import { Pipe, PipeTransform } from '@angular/core';
import { EventParticipantWithPlayerInfo } from '../data-access/event.service';
import { getFormattedParticipantList } from '../util/event-helpers';

@Pipe({
  name: 'participantList',
  standalone: true,
})
export class ParticipantListPipe implements PipeTransform {
  transform(
    participants: EventParticipantWithPlayerInfo[] | null | undefined,
  ): string {
    return getFormattedParticipantList(participants);
  }
}
