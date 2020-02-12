import { Actions, Effect, ofType } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';


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
    switchMap(actionData => {
      return this.http.get(nodeServer + 'fetchSingle', {
        params: {
          _id: actionData['payload']
        }
      })
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            return new CompanyActions.UpdateSingleCompany({company: res['company']});
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
}








  // @Effect()
  // register = this.actions$.pipe(
  //   ofType(CompanyActions.STORE_COMPANY_IN_DB),
  //   switchMap(actionData => {
  //     const companyData = new FormData();
  //     Object.keys(actionData['payload']).forEach(key => {
  //       companyData.append(key, actionData['payload'][key]);
  //     });
  //     return this.http.post(nodeServer + 'register', companyData)
  //       .pipe(
  //         map(res => {
  //           if(res['type'] === 'success'){
  //             // this.store.dispatch(new AuthActions.AddActiveEmployeeCompany(res['company']));
  //             return new CompanyActions.SetSingleCompany({company: res['company'], redirect: true});
  //           }
  //         }),
  //         catchError(err => {
  //           return handleError(err);
  //         })
  //       );
  //     }
  //   )
  // )

    // @Effect({dispatch: false})
  // redirect = this.actions$.pipe(
  //   ofType(CompanyActions.UPDATE_SINGLE_COMPANY),
  //   tap((actionData: CompanyActions.UpdateSingleCompany) => {
  //     if(actionData.payload.redirect){
  //       const currUrl = this.route.snapshot['_routerState'].url.substring(1).split("/");
  //       this.router.navigate([currUrl[0]]);
  //     }
  //   })
  // )










