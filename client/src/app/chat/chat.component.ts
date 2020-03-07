import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

import * as fromApp from '../store/app.reducer';
import { Employee } from 'app/employees/employee.model';
import { Company } from 'app/company/company.model';
import { Conversation } from './conversation.model';
import { ChatService } from './chat-socket.service';
import * as AuthActions from '../auth/store/auth.actions';
import { Message } from './message.model';


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

  constructor(private renderer: Renderer2,
              private chatService: ChatService,
              private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.store.dispatch(new AuthActions.RemoveChatNotification());
    this.subscription = this.store.select('auth').subscribe(authState => {
      this.user = authState.user;
      this.userKind = authState.user ? authState.kind[0].toUpperCase() + authState.kind.slice(1) : null;
      this.conversations = authState.conversations;

      if (this.conversations) {
        this.conversations.forEach(con => {
          const userId = con.participants.findIndex(participant => participant['user']['_id'] === this.user._id);
          if (userId !== -1) {
            con.participants.splice(userId, 1);
          }
        });
      }
    });
    this.nameList = new Map<string, { _id: string, fullName: string, type: string }>();
  }

  onGetNames(nameList: Map<string, { _id: string, fullName: string, type: string }>) {
    this.nameList = nameList;
  }

  // tslint:disable-next-line: variable-name
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

    this.chatService.sendMessage('postAMsg', {
      senderId: this.user._id,
      senderType: this.userKind,
      content: form.value.messageContent,
      privateMsg: this.privateMsg,
      recipients: Array.from(this.nameList.keys()).map(key => {
        const nameObj = this.nameList.get(key);
        return { _id: nameObj._id, type: nameObj.type };
      })
    });

    if (this.currConversation) {
      this.store.dispatch(new AuthActions.SetSingleConversation({
        conversation: this.currConversation,
        message: new Message({
          sender: { _id: this.user._id, name: this.getFullName(this.user) },
          content: form.value.messageContent,
          createdAt: new Date()
        })
      }));
    }

    if (!this.currConversation) {
      this.sendMessageForm.resetForm();
      this.nameList.clear();
    }
    this.sendMessageForm.form.patchValue({
      messageContent: ''
    });
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

    if (this.currConversation.messages.length && typeof(this.currConversation.messages[0].createdAt) === 'string') {
      let prevMsgDate: string = null;
      this.currConversation.messages.forEach(msg => {
        msg.createdAt = new Date(msg.createdAt);
        msg['first'] = !prevMsgDate || prevMsgDate !== msg.createdAt.toDateString() ? msg.createdAt.toDateString() : null;
        msg['hours'] = msg.createdAt.getHours().toString().padStart(2, '0');
        msg['minutes'] = msg.createdAt.getMinutes().toString().padStart(2, '0');
        prevMsgDate = msg.createdAt.toDateString();
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

