import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';


import * as fromApp from '../store/app.reducer';
import * as JobActions from './store/job.actions';
import { Job } from './job.model';
import { environment } from 'environments/environment';


@Injectable({
  providedIn: 'root'
})
export class JobResolverService implements Resolve<Job[]> {

  constructor(private store: Store<fromApp.AppState>,
              private actions$: Actions) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select('job').pipe(
      take(1),
      switchMap(jobState => {
        const timeFromLastFetchMS = !jobState.lastFetch ? null :
                                    new Date().getTime() - jobState.lastFetch.getTime();
        if (!jobState.messages.length && !jobState.jobs.length || timeFromLastFetchMS > environment.fetchDataMSReset) {
          this.store.dispatch(new JobActions.FetchJobs());
          return this.actions$.pipe(
            ofType(JobActions.SET_JOBS, JobActions.JOB_OP_FAILURE),
            take(1)
            );
        } else {
          return of(jobState.jobs);
        }
      })
    );
  }
}




















