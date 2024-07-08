import { EventParticipantWithPlayerInfo } from '../data-access/event.service';

export function getFormattedParticipantList(
  participants: EventParticipantWithPlayerInfo[] | undefined | null,
) {
  if (!participants) return '';

  const participantNames = participants.map(
    (participant) => ` ${participant.display_name}`,
  );

  if (participantNames.length < 2) return participantNames.toString();

  const lastParticipantName = participantNames.pop();
  return `${participantNames.toString()} &${lastParticipantName}`.substring(1); // remove 1st space;
}
