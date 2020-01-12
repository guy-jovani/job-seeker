import { Actions, Effect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';


import * as CompanyActions from './company.actions';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';
import { switchMap, map, catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import * as AuthActions from '../../auth/store/auth.actions';
import { Company } from '../company.model';

const nodeServer = environment.nodeServer + 'companies/';

const handleError = (errorRes: any) => {
  let messages: any[] = [];
  if(!errorRes.error || !errorRes.error.errors){
    messages = ['an unknown error occured'];
  } else {
    for(let err of errorRes.error.errors){
      messages.push(err['msg'])
    }
  }
  return of(new CompanyActions.CompanyOpFailure(messages));
}

@Injectable()
export class CompanyEffects {

  constructor(private actions$: Actions,
              private router: Router,
              private http: HttpClient,
              private store: Store<fromApp.AppState>){}


  @Effect()
  register = this.actions$.pipe(
    ofType(CompanyActions.STORE_COMPANY_IN_DB),
    switchMap(actionData => {
      const companyData = new FormData();
      Object.keys(actionData['payload']).forEach(key => {
        companyData.append(key, actionData['payload'][key]);
      });
      return this.http.post(nodeServer + 'register', companyData)
        .pipe(
          map(res => {
            if(res['type'] === 'success'){ 
              this.store.dispatch(new AuthActions.AddActiveEmployeeCompany(res['company']));
              return new CompanyActions.SetSingleCompany({company: res['company'], redirect: true});
            }          
          }),
          catchError(err => {
            return handleError(err);
          })
        );
      }
    )
  )

  @Effect()
  updateSingle = this.actions$.pipe(
    ofType(CompanyActions.UPDATE_SINGLE_COMPANY_IN_DB),
    switchMap((actionData: { payload: Company }) => {
      const companyData = new FormData();
      Object.keys(actionData.payload).forEach(key => {
        companyData.append(key, actionData.payload[key]);
      });
      return this.http.post(nodeServer + 'update', companyData)
        .pipe(
          map(res => {
            if(res['type'] === 'success'){ 
              this.store.dispatch(new AuthActions.AddActiveEmployeeCompany(res['company']));
              return new CompanyActions.UpdateSingleCompany({company: res['company'], redirect: true});
            }          
          }),
          catchError(err => {
            return handleError(err);
          })
        );
      }
    )
  )

  @Effect({dispatch: false})
  redirect = this.actions$.pipe(
    ofType(CompanyActions.SET_SINGLE_COMPANY, CompanyActions.UPDATE_SINGLE_COMPANY),
    tap((actionData: CompanyActions.SetSingleCompany | CompanyActions.UpdateSingleCompany) => { 
      if(actionData.payload.redirect){
        this.router.navigate(['/companies'])
      }
    })
  )

  @Effect()
  fetchAll = this.actions$.pipe(
    ofType(CompanyActions.FETCH_ALL_COMPANIES),
    switchMap(() => {
      return this.http.get(nodeServer + 'fetchAll')
      .pipe(
        map(res => {
          if(res['type'] === 'success'){
            return new CompanyActions.SetAllCompanies(res['companies']);
          }          
        }),
        catchError(err => {
          return handleError(err);
        })
      );
    })
  )

  @Effect()
  fetchSingle = this.actions$.pipe(
    ofType(CompanyActions.FETCH_SINGLE_COMPANY),
    switchMap(actionData => {
      return this.http.get(nodeServer + 'fetchSingle', {
        params: {
          _id: actionData['payload']
        }
      })
      .pipe(
        map(res => {
          if(res['type'] === 'success'){
            return new CompanyActions.UpdateSingleCompany({company: res['company'], redirect: false});
          }          
        }),
        catchError(err => {
          return handleError(err);
        })
      );
    })
  )
}

















