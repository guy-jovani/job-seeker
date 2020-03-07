import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take, switchMap, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { Injectable } from '@angular/core';

import * as fromApp from '../store/app.reducer';
import { Conversation } from './conversation.model';
import * as AuthActions from '../auth/store/auth.actions';

@Injectable({
  providedIn: 'root'
})
export class ChatResolverService implements Resolve<Conversation[]> {
  constructor(private store: Store<fromApp.AppState>,
              private actions$: Actions) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select('auth').pipe(
      take(1),
      map(authState => {
        return authState.conversations;
      }),
      switchMap(conversations => {
        console.log('chat resolver')
        // if (!conversations || !conversations.length) {
        this.store.dispatch(new AuthActions.FetchAllConversations());
        return this.actions$.pipe(
          ofType(AuthActions.SET_ALL_CONVERSATIONS),
          take(1)
        );
        // } else {
        //   return of(conversations);
        // }
      })
    );
  }
}




















