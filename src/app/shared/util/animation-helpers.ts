import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
} from '@angular/router';
import { Observable, filter, switchMap, map, identity, delay } from 'rxjs';

export function preventGlitchySwipeBackAnimation<T>(
  router: Router,
  routerOutlet: () => RouterOutlet,
  animationRouteDataName: string,
): Observable<T> {
  return router.events.pipe(
    filter(
      (event): event is NavigationStart => event instanceof NavigationStart,
    ),
    switchMap((navigationStartEvent) =>
      router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map(
          () =>
            routerOutlet().activatedRoute.snapshot.data?.[
              animationRouteDataName
            ],
        ),
        // only play animation when navigation triggered by the UI, aka "imperative"
        navigationStartEvent.navigationTrigger === 'imperative'
          ? identity
          : delay(0),
      ),
    ),
  );
}
