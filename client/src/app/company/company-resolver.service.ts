import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Company } from './company.model';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import { Actions, ofType } from '@ngrx/effects';
import { take, switchMap, } from 'rxjs/operators';
import * as CompanyActions from './store/company.actions';
import { of } from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({providedIn: 'root'})
export class CompanyResolverService implements Resolve<Company[]> {

  constructor(private store: Store<fromApp.AppState>,
              private actions$: Actions) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select('company').pipe(
      take(1),
      switchMap(companyState => {
        const timeFromLastFetchMS = !companyState.lastFetch ? null :
                                    new Date().getTime() - companyState.lastFetch.getTime();
        if (!companyState.companies.length || timeFromLastFetchMS > environment.fetchDataMSReset) {
          this.store.dispatch(new CompanyActions.FetchAllCompanies());
          return this.actions$.pipe(
            ofType(CompanyActions.SET_ALL_COMPANIES, CompanyActions.COMPANY_OP_FAILURE),
            take(1)
          );
        } else {
          return of(companyState.companies);
        }
      })
    );
  }
}














