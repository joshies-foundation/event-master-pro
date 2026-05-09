import {
  EventParticipantWithPlayerInfo,
  EventTeamWithParticipantInfo,
} from '../data-access/event.service';
import { EventTeamModel } from './supabase-types';

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

export function teamsWithParticipantInfo(
  allTeams: EventTeamModel[],
  allParticipants: EventParticipantWithPlayerInfo[],
): EventTeamWithParticipantInfo[] {
  return allTeams.map((team) => ({
    ...team,
    participants:
      allParticipants?.filter(
        (participant) => participant.team_id === team.id,
      ) ?? [],
  }));
}
