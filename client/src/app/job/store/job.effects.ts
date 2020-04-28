import { Actions, Effect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';

import * as fromApp from '../../store/app.reducer';
import * as JobActions from './job.actions';
import { Store } from '@ngrx/store';
import { UserStorageService } from 'app/user/user-storage.service';

const nodeServer = environment.nodeServer + 'jobs/';


@Injectable()
export class JobEffects {

  constructor(private actions$: Actions,
              private store: Store<fromApp.AppState>,
              private userStorageService: UserStorageService,
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
    withLatestFrom(this.store.select('job')),
    switchMap(([actionData, jobState]) => {
      const body = { page: jobState['page'].toString() };
      if (jobState['searchQuery']) {
        body['searchQuery'] = JSON.stringify(jobState['searchQuery']);
        this.userStorageService.setUserSearchQueries(body['searchQuery'], 'job');
      }
      return this.http.get(nodeServer + 'fetchJobs', {
        params: body
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
