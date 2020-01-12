import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Company } from './company.model';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../store/app.reducer';
import { Actions, ofType } from '@ngrx/effects';
import { map, take, switchMap, tap } from 'rxjs/operators';
import * as CompanyActions from './store/company.actions';
import { of } from 'rxjs';


@Injectable({providedIn: 'root'})
export class CompanyResolverService implements Resolve<Company[]> {

  constructor(private store: Store<fromApp.AppState>, 
              private actions$: Actions,
              private router: Router){}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){ 
    return this.store.select('company').pipe(
      take(1),
      map(companyState => {
        return companyState.companies;
      }),
      switchMap(companies => {
       if(!companies.length){
        this.store.dispatch(new CompanyActions.FetchAllCompanies());
        return this.actions$.pipe(
          ofType(CompanyActions.SET_ALL_COMPANIES),
          take(1)
        );
       } else {
         return of(companies); 
       }
      })
    )
  }
}














