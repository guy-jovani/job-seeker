import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';


import * as fromApp from '../store/app.reducer';
import * as PositionActions from './store/position.actions';
import { Position } from './position.model';
import { environment } from 'environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PositionResolverService implements Resolve<Position[]> {

  constructor(private store: Store<fromApp.AppState>,
              private actions$: Actions){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select('position').pipe(
      take(1),
      switchMap(positionState => {
        const timeFromLastFetchMS = !positionState.lastFetch ? null :
                                    new Date().getTime() - positionState.lastFetch.getTime();
        if (!positionState.positions.length || timeFromLastFetchMS && timeFromLastFetchMS > environment.fetchDataMSReset) {
          this.store.dispatch(new PositionActions.FetchAllPositions());
          return this.actions$.pipe(
            ofType(PositionActions.SET_ALL_POSITIONS),
            take(1)
          );
        } else {
          return of(positionState.positions);
        }
      })
    );
  }
}




















