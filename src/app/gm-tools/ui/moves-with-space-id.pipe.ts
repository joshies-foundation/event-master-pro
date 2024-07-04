import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'movesWithSpaceId',
  standalone: true,
})
export class MovesWithSpaceIdPipe implements PipeTransform {
  transform<T extends { gameboard_space_id: number | null }>(
    moves: T[],
    gameboardSpaceId: number,
  ): T[] {
    return moves.filter((move) => move.gameboard_space_id === gameboardSpaceId);
  }
}
