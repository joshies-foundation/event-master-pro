import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import { EventModel } from '../../shared/util/supabase-types';
import { EventService } from '../../shared/data-access/event.service';

export const editEventResolver: ResolveFn<EventModel | null> = (route) => {
  const eventService = inject(EventService);
  const eventId = Number(route.params['eventId']);

  return eventService.events$.pipe(
    map((events) => events?.find((event) => event.id === eventId) ?? null),
  );
};
