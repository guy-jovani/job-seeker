import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take, switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';


import * as fromApp from '../store/app.reducer';
import * as PositionActions from './store/position.actions';
import { Position } from './position.model';


@Injectable({
  providedIn: 'root'
})
export class PositionResolverService implements Resolve<Position[]> {

  constructor(private store: Store<fromApp.AppState>,
              private actions$: Actions){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select('position').pipe(
      take(1),
      map(positionState => {
        return positionState.positions;
      }),
      switchMap(positions => {
        if (!positions.length) {
          this.store.dispatch(new PositionActions.FetchAllPositions());
          return this.actions$.pipe(
            ofType(PositionActions.SET_ALL_POSITIONS),
            take(1)
          );
        } else {
          return of(positions);
        }
      })
    );
  }
}




















