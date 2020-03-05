import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

import * as fromApp from '../store/app.reducer';
import { Employee } from 'app/employees/employee.model';
import { Company } from 'app/company/company.model';
import { environment } from 'environments/environment';
import { Conversation } from './conversation.model';



@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  user: Employee | Company = null;
  nameList: Map<string, { _id: string, fullName: string, type: string }> = null;
  errorMessages: string[] = [];
  privateMsg = true;
  userKind: string = null;
  conversations: Conversation[] = null;
  conversationDiv: ElementRef = null;
  currConversation: Conversation = null;

  @ViewChild('sendMessageForm', { static: false }) sendMessageForm: NgForm;

  constructor(private http: HttpClient,
              private renderer: Renderer2,
              private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.subscription = this.store.select('auth').subscribe(authState => {
      this.user = authState.user;
      this.userKind = authState.user ? authState.kind[0].toUpperCase() + authState.kind.slice(1) : null;
      this.conversations = authState.conversations;
      if (this.conversations) {
        this.conversations.forEach(con => {
          con.participants.splice(con.participants.findIndex(participant => participant['user']['_id'] === this.user._id), 1);
        });
      }
    });
    this.nameList = new Map<string, { _id: string, fullName: string, type: string }>();
  }

  onGetNames(nameList: Map<string, { _id: string, fullName: string, type: string }>) {
    this.nameList = nameList;
  }

  onRemoveName(_id: string) {
    this.nameList.delete(_id);
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.errorMessages.push('You can\'t send an empty message.');
    }
    if (!this.nameList.size) {
      this.errorMessages.push('You need to choose who to send the message to.');
    }
    if (this.errorMessages.length) {
      return;
    }
    const nodeServer = environment.nodeServer + 'chat/postMessage/';
    this.http.post(nodeServer,
      {
        senderId: this.user._id,
        senderType: this.userKind,
        message: form.value.messageContent,
        privateMsg: this.privateMsg,
        recipients: Array.from(this.nameList.keys()).map(key => {
          const nameObj = this.nameList.get(key);
          return { _id: nameObj._id, type: nameObj.type };
        })
      })
    .pipe(take(1))
    .subscribe(
      res => {
        if (res['type'] === 'success') {
          if (!this.currConversation) {
            this.sendMessageForm.resetForm();
            this.nameList.clear();
          }
          this.sendMessageForm.form.patchValue({
            messageContent: ''
          })
        } else {
          this.errorMessages.push(...res['messages']);
        }
      },
      errorMessages => {
        this.errorMessages.push(...errorMessages);
      }
    );
  }

  onFucosCon(conversationDiv: ElementRef) {
    if (this.conversationDiv) {
      this.renderer.removeClass(this.conversationDiv, 'active-con');
    }
    this.conversationDiv = conversationDiv;
    this.renderer.addClass(this.conversationDiv, 'active-con');
    this.currConversation = this.conversations[this.conversationDiv['attributes']['data-con-ind'].value];
    this.nameList.clear();
    for (const participant of this.currConversation.participants) {
      this.nameList.set(participant['user']['_id'], { _id: participant['user']['_id'],
                  fullName: this.getFullName(participant.user), type: participant['type'] });
    }
    this.privateMsg = this.nameList.size === 1 ? true : false;

    if (typeof(this.currConversation.messages[0].createdAt) === 'string') {
      let lastDay = null;
      this.currConversation.messages.forEach(msg => {
        msg.createdAt = new Date(msg.createdAt);
        msg['first'] = !lastDay ? true : false;
        msg['hours'] = msg.createdAt.getHours().toString().padStart(2, '0');
        msg['minutes'] = msg.createdAt.getMinutes().toString().padStart(2, '0');
        lastDay = msg['hours'] ;
      });
    }
  }

  getFullName(user: { _id: string; name?: string; firstName?: string; lastName?: string; }) {
    return user['name'] ? user['name'] :
          ((user['firstName'] || '') + ' ' + (user['lastName'] || '')).trim();
  }

  onClose() {
    this.errorMessages = [];
  }

  onNewMessage(privateMsg: boolean) {
    this.privateMsg = privateMsg;
    this.nameList.clear();
    this.currConversation = null;
    if (this.conversationDiv) {
      this.renderer.removeClass(this.conversationDiv, 'active-con');
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

