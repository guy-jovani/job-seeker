import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import * as fromApp from '../store/app.reducer';
import { Employee } from 'app/employees/employee.model';
import { Company } from 'app/company/company.model';
import { Conversation } from './conversation.model';
import { ChatService } from './chat-socket.service';
import * as UserActions from '../user/store/user.actions';
import { Message } from './message.model';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  user: Employee | Company = null;
  nameList: Map<string, { _id: string, fullName: string, type: string, nameColor?: SafeStyle }> = null;
  messages: string[] = [];
  privateMsg = true;
  userKind: string = null;
  conversations: Conversation[] = null;
  conversationDiv: ElementRef = null;
  currConversation: Conversation = null;
  isLoading = false;

  @ViewChild('sendMessageForm', { static: false }) sendMessageForm: NgForm;

  constructor(private renderer: Renderer2,
              private chatService: ChatService,
              private sanitizer: DomSanitizer,
              private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.store.dispatch(new UserActions.RemoveChatNotification());
    this.subscription = this.store.select('user').subscribe(userState => {
      this.user = userState.user;
      this.userKind = userState.user ? userState.kind[0].toUpperCase() + userState.kind.slice(1) : null;
      this.conversations = userState.conversations;
      this.isLoading = userState.loading;
      console.log(this.isLoading)

      if (this.conversations) {
        this.conversations.forEach(con => {
          const userId = con.participants.findIndex(participant => participant['user']['_id'] === this.user._id);
          if (userId !== -1) {
            con.participants.splice(userId, 1); // removig curr user from participants list
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
      this.messages.push('You can\'t send an empty message.');
    }
    if (!this.nameList.size) {
      this.messages.push('You need to choose who to send the message to.');
    }
    if (this.messages.length) {
      return;
    }

    this.chatService.sendMessage('postAMsg', {
      ownerId: this.user._id,
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
      this.store.dispatch(new UserActions.SetSingleConversation({
        conversation: this.currConversation,
        message: new Message({
          creator: this.user._id,
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

      const participantNameList = this.nameList.get(participant.user._id);
      if (participantNameList) {
        this.nameList.set(participant.user._id, { ...participantNameList,
          nameColor: this.sanitizer.bypassSecurityTrustStyle(`rgb(\
            ${(Math.floor(Math.random() * 255))},${(Math.floor(Math.random() * 128))},\
            ${(Math.floor(Math.random() * 255))})`)});
      }
    }

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
    this.privateMsg = this.currConversation.participants.length === 1;
  }

  getFullName(user: { _id: string; name?: string; firstName?: string; lastName?: string; }) {
    return user['name'] ? user['name'] :
          ((user['firstName'] || '') + ' ' + (user['lastName'] || '')).trim();
  }

  onClose() {
    this.messages = [];
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

