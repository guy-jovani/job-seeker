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
import { Conversation } from 'app/chat/conversation.model';
import { UserSessionService } from '../user-session.service';


@Injectable()
export class UserEffects {

  constructor(private actions$: Actions,
              private http: HttpClient,
              private store: Store<fromApp.AppState>,
              private userSessionService: UserSessionService,
              private router: Router) {}


  @Effect({dispatch: false})
  activeUserChangesNavigation = this.actions$.pipe(
    ofType(UserActions.UPDATE_ACTIVE_USER),
    map((actionData: UserActions.UpdateActiveUser) => {
      this.userSessionService.setUserSessionStorage(actionData.payload.user);
      if (actionData.payload.redirect) {
        this.router.navigate([actionData.payload.redirect]);
      }
    })
  );

  @Effect({dispatch: false})
  AddUpdateJobToUserNavigation = this.actions$.pipe(
    ofType(UserActions.COMPANY_CREATED_JOB, UserActions.COMPANY_UPDATED_JOB),
    map((actionData: UserActions.CompanyCreatedJob | UserActions.CompanyUpdatedJob) => {
      this.userSessionService.updateUserJobsSessionStorage(actionData.payload, actionData.type);
      this.router.navigate(['../my-jobs']);
    })
  );


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

  @Effect()
  deleteWorkEmployee = this.actions$.pipe(
    ofType(UserActions.DELETE_WORK_EMPLOYEE_IN_DB),
    withLatestFrom(this.store.select('user')),
    switchMap(([actionData, userState]) => {
      return this.http.delete(environment.nodeServer  + 'employees/deleteWork', {
          params: {
            workId: actionData['payload'], _id: userState.user._id
          }
        })
        .pipe(
          map(res => {
            if (res['type'] === 'success') {
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
}

















