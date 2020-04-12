import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import * as fromApp from './store/app.reducer';
import * as AuthActions from './auth/store/auth.actions';
import * as UserActions from './user/store/user.actions';
import * as JobActions from './job/store/job.actions';
import * as CompanyActions from './company/store/company.actions';
import { ChatService } from './chat/chat-socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  socketPostedSub: Subscription;
  socketReadSub: Subscription;
  socketReconnectSub: Subscription;
  socketUpdatedStatus: Subscription;
  userSub: Subscription;
  authSub: Subscription;
  routerSub: Subscription;
  messages: string[] = [];
  currUrl: string[];
  userId: string = null;
  refreshing: boolean;

  constructor(private store: Store<fromApp.AppState>,
              private chatService: ChatService,
              private router: Router) {}


  ngOnInit() {
    this.store.dispatch(new AuthActions.AutoLogin()); // in case of a page refresh - so the socket will reconnect

    this.userSub = this.store.select('user').subscribe(userState => {
      this.userId = userState.user ? userState.user._id : null;
    });

    this.authSub = this.store.select('auth').subscribe(authState => {
      this.refreshing = authState.refreshing;
    });

    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(routerObj => {
      this.currUrl = routerObj['url'].substring(1).split('/');
    });

    this.socketPostedSub = this.chatService.getMessage('posted').subscribe(res => {
      try {
        console.log('posted')
        if (res['type'] === 'success') {
          const stringMessage = res['message']['content'] ? res['message'] : null;
          const fileMessage = res['message']['filePath'] ? res['message'] : null;
          this.store.dispatch(new UserActions.SetSingleConversation({
            conversation: res['conversation'], stringMessage, fileMessage
          }));
          if (this.currUrl.length === 1 && this.currUrl[0] !== 'chat') {
            this.store.dispatch(new UserActions.SetChatNotification());
          }
        } else {
          this.messages.push(...res['messages']);
        }
      } catch (error) {
        this.messages.push('There was a problem sending the message, please refresh your page and try again');
      }
    });

    this.socketReadSub = this.chatService.getMessage('read').subscribe(res => {
      try {
        console.log('read')
        if (res['type'] === 'success') {
          this.store.dispatch(new UserActions.SetSingleConversation({
            conversation: res['conversation']
          }));
        } else {
          this.messages.push(...res['messages']);
        }
      } catch (error) {
        this.messages.push('There was a problem sending the message, please refresh your page and try again');
      }
    });

    this.socketReconnectSub = this.chatService.getMessage('reconnect')
      .subscribe(() => {
        if (this.userId) {
          this.chatService.sendMessage('login', {  _id: this.userId } );
        }
      });

    this.socketUpdatedStatus = this.chatService.getMessage('updatedStatus')
      .subscribe(res => {
        if (res['type'] === 'success') {
          if (this.currUrl[0] === 'jobs') {
            this.store.dispatch(new JobActions.ClearError());
          } else if (this.currUrl[0] === 'companies') {
            this.store.dispatch(new CompanyActions.ClearError());
          }
          this.store.dispatch(new UserActions.UpdateActiveUser({
            user: res['user'],
            kind: res['kind'],
            redirect: this.currUrl[0] === 'my-jobs' ? 'my-jobs' : ''
          }));
        } else {
          if (this.currUrl[0] === 'jobs') {
            this.store.dispatch(new JobActions.JobOpFailure(res['messages']));
          } else if (this.currUrl[0] === 'companies') {
            this.store.dispatch(new CompanyActions.CompanyOpFailure(res['messages']));
          } else { // this.currUrl[0] === 'my-jobs'
            this.store.dispatch(new UserActions.UserFailure(res['messages']));
          }
        }
      });
  }

  onClose() {
    this.messages = [];
  }

  ngOnDestroy() {
    if (this.socketPostedSub) {
      this.socketPostedSub.unsubscribe();
    }
    if (this.socketReconnectSub) {
      this.socketReconnectSub.unsubscribe();
    }
    if (this.socketReadSub) {
      this.socketReadSub.unsubscribe();
    }
    if (this.socketUpdatedStatus) {
      this.socketPostedSub.unsubscribe();
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

}
