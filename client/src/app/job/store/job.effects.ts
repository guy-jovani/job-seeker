import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';


import * as fromApp from '../../store/app.reducer';
import { environment } from '../../../environments/environment';

import * as JobActions from './job.actions';
import * as UserActions from '../../user/store/user.actions';
import { of } from 'rxjs';

const nodeServer = environment.nodeServer + 'jobs/';


@Injectable()
export class JobEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
              private store: Store<fromApp.AppState>) {}

  @Effect()
  createJob = this.actions$.pipe(
    ofType(JobActions.CREATE_JOB_IN_DB),
    switchMap(actionData => {
      return this.http.put(nodeServer + 'create', actionData['payload'])
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            this.store.dispatch(new JobActions.ClearError());
            return new UserActions.CompanyCreatedJob(res['job']);
          } else {
            return new JobActions.JobOpFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return of(new JobActions.JobOpFailure(messages));
        })
      );
    })
  );

  @Effect()
  updateSingleJobInDb = this.actions$.pipe(
    ofType(JobActions.UPDATE_SINGLE_JOB_IN_DB),
    switchMap(actionData => {
      return this.http.post(nodeServer + 'update', actionData['payload'])
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            this.store.dispatch(new JobActions.ClearError());
            return new UserActions.CompanyUpdatedJob(res['job']);
          } else {
            return new JobActions.JobOpFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return of(new JobActions.JobOpFailure(messages));
        })
      );
    })
  );

  @Effect()
  fetchSingleJob = this.actions$.pipe(
    ofType(JobActions.FETCH_SINGLE_JOB),
    switchMap((actionData: JobActions.FetchSingleJob) => {
      return this.http.get(nodeServer + 'fetchSingle', {
        params: { _id: actionData.payload._id }
      })
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            return new JobActions.AddUpdateSingleJob({ job: res['job'], main: actionData.payload.main });
          } else {
            return new JobActions.JobOpFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return of(new JobActions.JobOpFailure(messages));
        })
      );
    })
  );

  @Effect()
  fetchAllJobs = this.actions$.pipe(
    ofType(JobActions.FETCH_ALL_JOBS),
    switchMap(actionData => {
      return this.http.get(nodeServer + 'fetchAll')
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            return new JobActions.SetAllJobs(res['jobs']);
          } else {
            return new JobActions.JobOpFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return of(new JobActions.JobOpFailure(messages));
        })
      );
    })
  );

}
