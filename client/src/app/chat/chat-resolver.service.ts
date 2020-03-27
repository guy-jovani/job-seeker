import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { take, switchMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

import * as fromApp from '../store/app.reducer';
import { Conversation } from './conversation.model';
import * as UserActions from '../user/store/user.actions';
import { environment } from 'environments/environment';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatResolverService implements Resolve<Conversation[]> {
  constructor(private store: Store<fromApp.AppState>,
              private actions$: Actions) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select('user').pipe(
      take(1),
      switchMap(userState => {
        const timeFromLastFetchMS = !userState.lastFetchConversations ? null :
                                new Date().getTime() - userState.lastFetchConversations.getTime();
        if (!timeFromLastFetchMS || timeFromLastFetchMS > environment.fetchDataMSReset) {
          this.store.dispatch(new UserActions.FetchAllConversations());
        }
        return of(userState.conversations);
      })
    );
  }
}




















