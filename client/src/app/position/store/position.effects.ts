import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';


import * as fromApp from '../../store/app.reducer';
import { environment } from '../../../environments/environment';

import * as PositionActions from './position.actions';
import * as CompanyActions from '../../company/store/company.actions';
import * as AuthActions from '../../auth/store/auth.actions';
import { of } from 'rxjs';

const nodeServer = environment.nodeServer + 'positions/';


@Injectable()
export class PositionEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
              private store: Store<fromApp.AppState>) {}

  @Effect()
  createPosition = this.actions$.pipe(
    ofType(PositionActions.CREATE_POSITION_IN_DB),
    switchMap(actionData => {
      return this.http.put(nodeServer + 'create', actionData['payload'])
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            this.store.dispatch(new PositionActions.ClearError());
            return new AuthActions.AddPositionToUser(res['position']);
          } else {
            return new PositionActions.PositionOpFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return of(new PositionActions.PositionOpFailure(messages));
        })
      );
    })
  );

  @Effect()
  updateSinglePositionInDb = this.actions$.pipe(
    ofType(PositionActions.UPDATE_SINGLE_POSITION_IN_DB),
    switchMap(actionData => {
      return this.http.post(nodeServer + 'update', actionData['payload'])
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            return new AuthActions.UpdatePositionOfUser(res['position']);
          } else {
            return new PositionActions.PositionOpFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return of(new PositionActions.PositionOpFailure(messages));
        })
      );
    })
  );

  @Effect()
  fetchSinglePosition = this.actions$.pipe(
    ofType(PositionActions.FETCH_SINGLE_POSITION),
    switchMap((actionData: PositionActions.FetchSinglePosition) => {
      return this.http.get(nodeServer + 'fetchSingle', {
        params: { _id: actionData.payload._id }
      })
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            this.store.dispatch(new PositionActions.ClearError());
            this.store.dispatch(new CompanyActions.ClearError());
            return actionData.payload.main ?
                new PositionActions.UpdateSinglePosition({ position: res['position'], main: actionData.payload.main }) :
                new CompanyActions.UpdateSingleCompanyPosition(res['position']);
          } else {
            return new PositionActions.PositionOpFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return of(new PositionActions.PositionOpFailure(messages));
        })
      );
    })
  );

  @Effect()
  fetchAllPositions = this.actions$.pipe(
    ofType(PositionActions.FETCH_ALL_POSITIONS),
    switchMap(actionData => {
      return this.http.get(nodeServer + 'fetchAll')
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            return new PositionActions.SetAllPositions(res['positions']);
          } else {
            return new PositionActions.PositionOpFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return of(new PositionActions.PositionOpFailure(messages));
        })
      );
    })
  );

}
