import { Actions, Effect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';

import * as PositionActions from '../../position/store/position.actions';
import * as CompanyActions from './company.actions';
import * as UserActions from '../../user/store/user.actions';
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
              return new UserActions.UpdateActiveUser({ user: {...res['company']}, redirect: true, kind: 'company' });
            } else {
              return new CompanyActions.CompanyOpFailure(res['messages']);
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
    withLatestFrom(this.store.select('user')),
    switchMap(([actionData, userState]) => {
      return this.http.get(nodeServer + 'fetchAll', {
        params: { _id: userState.user._id }
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
          if (res['type'] === 'success') {
            if (actionData.payload.main) {
              return new CompanyActions.UpdateSingleCompany({company: res['company'], main: actionData.payload.main });
            } else {
              this.store.dispatch(new CompanyActions.ClearError());
              return new PositionActions.UpdateSinglePositionCompany({company: res['company'], posInd: actionData.payload.posInd });
            }
          } else {
            if (actionData.payload.main) {
              return new CompanyActions.CompanyOpFailure(res['messages']);
            } else {
              this.store.dispatch(new CompanyActions.ClearError());
              return new PositionActions.PositionOpFailure(res['messages']);
            }
          }
        }),
        catchError(messages => {
          if (actionData.payload.main) {
            return of(new CompanyActions.CompanyOpFailure(messages));
          } else {
            this.store.dispatch(new CompanyActions.ClearError());
            return of(new PositionActions.PositionOpFailure(messages));
          }
        })
      );
    })
  );
}















