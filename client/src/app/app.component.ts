import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';

import * as fromApp from './store/app.reducer';
import * as AuthActions from './auth/store/auth.actions';
import { ChatService } from './chat/chat-socket.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'company-web';
  socketSub: Subscription;
  errorMessages: string[] = [];
  authSub: Subscription;
  authConversationsExists = false;
  routerSub: Subscription;
  currUrl: string[];

  constructor(private store: Store<fromApp.AppState>,
              private chatService: ChatService,
              private router: Router) {}


  ngOnInit() {
    this.store.dispatch(new AuthActions.AutoLogin());

    this.authSub = this.store.select('auth').subscribe(authState => {
      this.authConversationsExists = authState.conversations && !!authState.conversations.length;
    });

    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(routerObj => {
      this.currUrl = routerObj['url'].substring(1).split('/');
    });

    this.socketSub = this.chatService.getMessage('posted').subscribe(res => {
      if (res['type'] === 'success') {
        if (this.authConversationsExists) {
          this.store.dispatch(new AuthActions.SetSingleConversation({
            conversation: res['conversation'], message: res['message']
          }));
        }
        if (this.currUrl.length === 1 && this.currUrl.length[0] !== 'chat') {
          this.store.dispatch(new AuthActions.SetChatNotification());
        }
      } else {
        this.errorMessages.push(...res['messages']);
      }
    });
  }

  onClose() {
    this.errorMessages = [];
  }

  ngOnDestroy() {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

}
