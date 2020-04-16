import { Actions, Effect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';

import * as JobActions from '../../job/store/job.actions';
import * as CompanyActions from './company.actions';
import { environment } from '../../../environments/environment';
import * as fromApp from '../../store/app.reducer';

const nodeServer = environment.nodeServer + 'companies/';


@Injectable()
export class CompanyEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
              private store: Store<fromApp.AppState>) {}


  @Effect()
  fetchCompanies = this.actions$.pipe(
    ofType(CompanyActions.FETCH_COMPANIES),
    withLatestFrom(this.store.select('user')),
    switchMap(([actionData, userState]) => {
      return this.http.get(nodeServer + 'fetchCompanies', {
        params: {
          _id: userState.user._id,
          page: actionData['payload']['page'],
          kind: userState.kind,
        }
      })
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            return new CompanyActions.SetCompanies({
              companies: res['companies'], total: res['total']
            });
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
              return new JobActions.UpdateSingleJobCompany({company: res['company'], jobInd: actionData.payload.jobInd });
            }
          } else {
            if (actionData.payload.main) {
              return new CompanyActions.CompanyOpFailure(res['messages']);
            } else {
              this.store.dispatch(new CompanyActions.ClearError());
              return new JobActions.JobOpFailure(res['messages']);
            }
          }
        }),
        catchError(messages => {
          if (actionData.payload.main) {
            return of(new CompanyActions.CompanyOpFailure(messages));
          } else {
            this.store.dispatch(new CompanyActions.ClearError());
            return of(new JobActions.JobOpFailure(messages));
          }
        })
      );
    })
  );
}















