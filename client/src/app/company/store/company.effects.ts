import { Actions, Effect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';

import * as PositionActions from '../../position/store/position.actions';
import * as CompanyActions from './company.actions';
import { environment } from '../../../environments/environment';
import * as fromApp from '../../store/app.reducer';
import * as AuthActions from '../../auth/store/auth.actions';

const nodeServer = environment.nodeServer + 'companies/';


@Injectable()
export class CompanyEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
              private store: Store<fromApp.AppState>) {}


  @Effect()
  updateActiveCompany = this.actions$.pipe(
    ofType(CompanyActions.UPDATE_SINGLE_COMPANY_IN_DB),
    switchMap((actionData) => {
      const companyData = new FormData();
      Object.keys(actionData['payload']['company']).forEach(key => {
        companyData.append(key, actionData['payload']['company'][key]);
      });
      if (actionData['payload']['password']) {
        companyData.append('password', actionData['payload']['password']);
        companyData.append('confirmPassword', actionData['payload']['confirmPassword']);
      }
      return this.http.post(nodeServer + 'update', companyData, {
          params: {
            removeImage: actionData['payload']['deleteImage'],
          }
        })
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              this.store.dispatch(new CompanyActions.ClearError());
              return new AuthActions.UpdateActiveUser({ user: {...res['company']}, kind: 'company' });
            } else {
              return new AuthActions.AuthFailure(res['messages']);
            }
          }),
          catchError(messages => {
            return of(new CompanyActions.CompanyOpFailure(messages));
          })
        );
      }
    )
  );

  @Effect()
  fetchAll = this.actions$.pipe(
    ofType(CompanyActions.FETCH_ALL_COMPANIES),
    withLatestFrom(this.store.select('auth')),
    switchMap(([actionData, authState]) => {
      return this.http.get(nodeServer + 'fetchAll', {
        params: { _id: authState.user._id }
      })
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            return new CompanyActions.SetAllCompanies(res['companies']);
          } else {
            return new CompanyActions.CompanyOpFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return of(new CompanyActions.CompanyOpFailure(messages));
        })
      );
    })
  );

  @Effect()
  fetchSingle = this.actions$.pipe(
    ofType(CompanyActions.FETCH_SINGLE_COMPANY),
    switchMap((actionData: CompanyActions.FetchSingleCompany) => {
      return this.http.get(nodeServer + 'fetchSingle', {
        params: {
          _id: actionData.payload._id
        }
      })
      .pipe(
        map(res => {
          this.store.dispatch(new PositionActions.ClearError());
          this.store.dispatch(new CompanyActions.ClearError());
          if (res['type'] === 'success') {
            return actionData.payload.main ?
                  new CompanyActions.UpdateSingleCompany({company: res['company'], main: actionData.payload.main }) :
                  new PositionActions.UpdateSinglePositionCompany({company: res['company'], posInd: actionData.payload.posInd });

          } else {
            return actionData.payload.main ?
                  new CompanyActions.CompanyOpFailure(res['messages']) :
                  new PositionActions.PositionOpFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return actionData.payload.main ?
                  of(new CompanyActions.CompanyOpFailure(messages)) :
                  of(new PositionActions.PositionOpFailure(messages));
        })
      );
    })
  );
}















