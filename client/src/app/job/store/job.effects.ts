import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';

import * as JobActions from './job.actions';

const nodeServer = environment.nodeServer + 'jobs/';


@Injectable()
export class JobEffects {

  constructor(private actions$: Actions,
              private http: HttpClient) {}

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
            return new JobActions.SetSingleJob({ job: res['job'], main: actionData.payload.main });
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
  fetchJobs = this.actions$.pipe(
    ofType(JobActions.FETCH_JOBS),
    switchMap(actionData => {
      return this.http.get(nodeServer + 'fetchJobs', {
        params: {
          page: actionData['payload']['page'],
        }
      })
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            return new JobActions.SetJobs({jobs: res['jobs'], total: res['total']});
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
