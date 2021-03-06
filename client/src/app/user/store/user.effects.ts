import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { switchMap, map, catchError, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';

import { environment } from '../../../environments/environment';
import * as fromApp from '../../store/app.reducer';
import * as UserActions from './user.actions';
import * as AuthActions from '../../auth/store/auth.actions';
import { Conversation } from 'app/chat/conversation.model';
import { UserStorageService } from '../user-storage.service';
import { AuthAutoLogoutService } from 'app/auth/auth-auto-logout.service';
import { Work } from 'app/employees/employee.model';


@Injectable()
export class UserEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
              private authAutoLogoutService: AuthAutoLogoutService,
              private store: Store<fromApp.AppState>,
              private userStorageService: UserStorageService,
              private router: Router) {}

  /*****************
   * User Actions
  *******************/

  @Effect()
  changeUserPassword = this.actions$.pipe(
    ofType(UserActions.CHANGE_USER_PASSWORD),
    withLatestFrom(this.store.select('user')),
    switchMap( ( [actionData, userState] ) =>  {
      return this.http.post(environment.nodeServer  + 'auth/changePassword', {
        currPassword: actionData['payload']['currPassword'],
        newPassword: actionData['payload']['newPassword'],
        confirmNewPassword: actionData['payload']['confirmNewPassword'],
        kind: actionData['payload']['kind'],
        _id: userState.user._id
      })
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            this.authAutoLogoutService.autoLogout(res['expiresInSeconds'] * 1000);
            this.store.dispatch(new UserActions.ClearError());
            return new AuthActions.AuthSuccess({
              redirect: false,
              token: res['accessToken'],
              refreshToken: res['refreshToken'],
              expiresInSeconds: res['expiresInSeconds'],
            });
          } else {
            return new UserActions.UserFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return of(new UserActions.UserFailure(messages));
        })
      );
    })
  );

  @Effect({dispatch: false})
  updateActiveUserNavigation = this.actions$.pipe(
    ofType(UserActions.UPDATE_ACTIVE_USER),
    map((actionData: UserActions.UpdateActiveUser) => {
      this.userStorageService.setUserStorage(actionData.payload.user, actionData.payload.kind);
      if (actionData.payload.redirect) {
        this.router.navigate([actionData.payload.redirect]);
      }
    })
  );

  @Effect({dispatch: false})
  createUpdateJobToUserNavigation = this.actions$.pipe(
    ofType(UserActions.COMPANY_CREATED_JOB, UserActions.COMPANY_UPDATED_JOB),
    map((actionData: UserActions.CompanyCreatedJob | UserActions.CompanyUpdatedJob) => {
      this.userStorageService.createdUpdateUserCompanyStorage(actionData.payload, actionData.type);
      this.router.navigate(['../my-jobs']);
    })
  );

  /*****************
   * Chat Actions
  *******************/

  @Effect()
  fetchAllConversations = this.actions$.pipe(
    ofType(UserActions.FETCH_ALL_CONVERSATIONS),
    withLatestFrom(this.store.select('user')),
    switchMap(([actionData, userState]) => {
      return this.http.get(environment.nodeServer + 'chat/fetchAllConversations',
        {
          params: {
            _id: userState.user._id
          }
        })
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              const cons = res['conversations'].map((con: Conversation) => {
                let prevMsgDate: string = null;
                con.messages.forEach(msg => {
                  msg.createdAt = new Date(msg.createdAt);
                  msg['first'] = !prevMsgDate || prevMsgDate !== msg.createdAt.toDateString() ? msg.createdAt.toDateString() : null;
                  msg['time'] = msg.createdAt.getHours().toString().padStart(2, '0') + ':' +
                                msg.createdAt.getMinutes().toString().padStart(2, '0');
                  prevMsgDate = msg.createdAt.toDateString();
                });
                return con;
              });

              return new UserActions.SetAllConversations(cons);
            } else {
              return new UserActions.UserFailure(res['messages']);
            }
          }),
          catchError(messages => {
            return of(new UserActions.UserFailure(messages));
          })
        );
    })
  );

  /*****************
   * Employee Actions
  *******************/

  @Effect()
  createWorkEmployee = this.actions$.pipe(
    ofType(UserActions.CREATE_WORK_EMPLOYEE_IN_DB),
    withLatestFrom(this.store.select('user')),
    switchMap(([actionData, userState]) => {
      return this.http.post(environment.nodeServer  + 'employees/createWork',
              { ...actionData['payload'] as object, _id: userState.user._id })
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              res['work']['startDate'] = new Date(res['work']['startDate']);
              res['work']['endDate'] = res['work']['endDate'] ?
                        new Date(res['work']['endDate']) : res['work']['endDate'];
              this.userStorageService.CRUDEmployeeWorkStorage(res['work'], UserActions.CREATED_WORK_EMPLOYEE);
              return new UserActions.CreatedWorkEmployee(res['work']);
            } else {
              return new UserActions.UserFailure(res['messages']);
            }
          }),
          catchError(messages => {
            return of(new UserActions.UserFailure(messages));
          })
        );
    })
  );

  @Effect()
  updateWorkEmployee = this.actions$.pipe(
    ofType(UserActions.UPDATE_WORK_EMPLOYEE_IN_DB),
    withLatestFrom(this.store.select('user')),
    switchMap(([actionData, userState]) => {
      return this.http.post(environment.nodeServer  + 'employees/updateWork',
                          { ...actionData['payload'] as object, _id: userState.user._id })
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              res['updatedWork']['startDate'] = new Date(res['updatedWork']['startDate']);
              res['updatedWork']['endDate'] =
                        res['updatedWork']['endDate'] ?
                        new Date(res['updatedWork']['endDate']) : res['updatedWork']['endDate'];

              this.userStorageService.CRUDEmployeeWorkStorage(res['updatedWork'], UserActions.UPDATED_WORK_EMPLOYEE);
              return new UserActions.UpdatedWorkEmployee( res['updatedWork']);
            } else {
              return new UserActions.UserFailure(res['messages']);
            }
          }),
          catchError(messages => {
            return of(new UserActions.UserFailure(messages));
          })
        );
    })
  );

  @Effect()
  deleteWorkEmployee = this.actions$.pipe(
    ofType(UserActions.DELETE_WORK_EMPLOYEE_IN_DB),
    withLatestFrom(this.store.select('user')),
    switchMap(([actionData, userState]) => {
      return this.http.delete(environment.nodeServer  + 'employees/deleteWork', {
          params: {
            workId: actionData['payload'],
            _id: userState.user._id
          }
        })
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              this.userStorageService.CRUDEmployeeWorkStorage(
                  new Work({_id: res['deletedWorkID']}), UserActions.UPDATED_WORK_EMPLOYEE);
              return new UserActions.DeletedWorkEmployee(res['deletedWorkID']);
            } else {
              return new UserActions.UserFailure(res['messages']);
            }
          }),
          catchError(messages => {
            return of(new UserActions.UserFailure(messages));
          })
        );
    })
  );

  @Effect()
  updateActiveEmployee = this.actions$.pipe(
    ofType(UserActions.UPDATE_SINGLE_EMPLOYEE_IN_DB),
    switchMap((actionData: UserActions.UpdateSingleEmployeeInDB) => {
      const employeeFormDate = this.getEmployeeUpdateFormData(actionData);
      return this.http.post(environment.nodeServer  + 'employees/update', employeeFormDate)
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              if (res['refreshToken']) {
                this.store.dispatch(new AuthActions.AuthSuccess({
                  redirect: false,
                  token: res['accessToken'],
                  refreshToken: res['refreshToken'],
                  expiresInSeconds: res['expiresInSeconds'],
                }));
                this.authAutoLogoutService.autoLogout(res['expiresInSeconds'] * 1000);
              }
              return new UserActions.UpdateActiveUser({ user: {...res['employee']}, redirect: 'my-details', kind: 'employee' });
            } else {
              return new UserActions.UserFailure(res['messages']);
            }
          }),
          catchError(messages => {
            return of(new UserActions.UserFailure(messages));
          })
        );
    })
  );

  /*****************
   * Company Actions
  *******************/

  @Effect()
  createSingleJobInDb = this.actions$.pipe(
    ofType(UserActions.COMPANY_CREATE_JOB_IN_DB),
    switchMap(actionData => {
      return this.http.put(environment.nodeServer + 'jobs/create', actionData['payload'])
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            return new UserActions.CompanyCreatedJob(res['job']);
          } else {
            return new UserActions.UserFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return of(new UserActions.UserFailure(messages));
        })
      );
    })
  );

  @Effect()
  updateSingleJobInDb = this.actions$.pipe(
    ofType(UserActions.COMPANY_UPDATE_JOB_IN_DB),
    switchMap(actionData => {
      return this.http.post(environment.nodeServer + 'jobs/update', actionData['payload'])
      .pipe(
        map(res => {
          if (res['type'] === 'success') {
            return new UserActions.CompanyUpdatedJob(res['job']);
          } else {
            return new UserActions.UserFailure(res['messages']);
          }
        }),
        catchError(messages => {
          return of(new UserActions.UserFailure(messages));
        })
      );
    })
  );

  @Effect()
  updateActiveCompany = this.actions$.pipe(
    ofType(UserActions.UPDATE_SINGLE_COMPANY_IN_DB),
    switchMap((actionData: UserActions.UpdateSingleCompanyInDb) => {
      const companyData = this.getCompanyUpdateFormData(actionData);

      return this.http.post(environment.nodeServer + 'companies/update', companyData, {
          params: {
            oldImages: actionData.payload.oldImagesPath.join(environment.splitCompanyOldImagesBy),
          }
        })
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
              this.store.dispatch(new UserActions.ClearError());
              if (res['refreshToken']) {
                this.store.dispatch(new AuthActions.AuthSuccess({
                  redirect: false,
                  token: res['accessToken'],
                  refreshToken: res['refreshToken'],
                  expiresInSeconds: res['expiresInSeconds'],
                }));
                this.authAutoLogoutService.autoLogout(res['expiresInSeconds'] * 1000);
              }
              return new UserActions.UpdateActiveUser({ user: {...res['company']}, redirect: 'my-details', kind: 'company' });
            } else {
              return new UserActions.UserFailure(res['messages']);
            }
          }),
          catchError(messages => {
            return of(new UserActions.UserFailure(messages));
          })
        );
      }
    )
  );

  private getCompanyUpdateFormData = (actionData: UserActions.UpdateSingleCompanyInDb) => {
    const companyData = new FormData();
    Object.keys(actionData.payload.company).forEach(key => {
      if (key === 'imagesPath') {
        actionData.payload.company[key].forEach(imageFile => {
          companyData.append(key, imageFile);
        });
      } else {
        companyData.append(key, actionData.payload.company[key]);
      }
    });
    if (environment.production) {
      companyData.append('firebaseImagesUrl', actionData.payload.firebaseImagesUrl.join(environment.splitCompanyOldImagesBy));
    }
    return companyData;
  }

  private getEmployeeUpdateFormData = (actionData: UserActions.UpdateSingleEmployeeInDB) => {
    const employeeFormDate = new FormData();
    Object.keys(actionData.payload.employee).forEach(key => {
      employeeFormDate.append(key, actionData.payload.employee[key]);
    });
    employeeFormDate.append('deleteImage', actionData.payload.deleteImage.toString() );
    return employeeFormDate;
  }
}

















