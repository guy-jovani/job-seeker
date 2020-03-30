import { Component, OnInit, OnDestroy, ViewChild,
        ElementRef, Renderer2, HostListener } from '@angular/core';
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
import { findReadVarNames } from '@angular/compiler/src/output/output_ast';


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
  keyMap = {};
  file: File;

  @ViewChild('sendMessageForm') sendMessageForm: NgForm;
  @ViewChild('textarea') textarea: ElementRef;
  @ViewChild('submitChat') submitChat: ElementRef;
  @ViewChild('inputUploadFile') inputUploadFile: ElementRef;

  constructor(private renderer: Renderer2,
              private chatService: ChatService,
              private sanitizer: DomSanitizer,
              private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.subscription = this.store.select('user').subscribe(userState => {
      this.user = userState.user;
      this.userKind = userState.user ? userState.kind[0].toUpperCase() + userState.kind.slice(1) : null;
      this.conversations = userState.conversations;
      this.isLoading = userState.loading;

      if (this.conversations) {
        this.conversations.forEach(con => {
          const userId = con.participants.findIndex(participant => participant['user']['_id'] === this.user._id);
          if (userId !== -1) {
            con.participants.splice(userId, 1); // removig curr user from participants list
          }
        });
      }
    });
    if (this.conversations) {
      this.store.dispatch(new UserActions.RemoveChatNotification());
    }
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
    if (this.textarea) {
      this.textarea.nativeElement.focus();
    }

    if (form.invalid && !this.file && (form.value.messageContent.trim() === '')) {
      this.messages.push('You can\'t send an empty message.');
    }
    if (!this.nameList.size) {
      this.messages.push('You need to choose who to send the message to.');
    }
    if (this.messages.length) {
      return;
    }

    if (this.file) { // update conversation in server
      this.chatService.sendMessage('postAMsg', {
        ownerId: this.user._id,
        senderId: this.user._id,
        senderType: this.userKind,
        content: null,
        file: this.file,
        fileName: this.file.name,
        fileNumBytes: this.file.size,
        privateMsg: this.privateMsg,
        recipients: Array.from(this.nameList.keys()).map(key => {
          const nameObj = this.nameList.get(key);
          return { _id: nameObj._id, type: nameObj.type };
        })
      });
    }

    if (form.value.messageContent) { // update conversation in server
      this.chatService.sendMessage('postAMsg', {
        ownerId: this.user._id,
        senderId: this.user._id,
        senderType: this.userKind,
        content: form.value.messageContent,
        file: null,
        privateMsg: this.privateMsg,
        recipients: Array.from(this.nameList.keys()).map(key => {
          const nameObj = this.nameList.get(key);
          return { _id: nameObj._id, type: nameObj.type };
        })
      });
    }


    // localy update the conversation - only for stringMessage
    if (this.currConversation && form.value.messageContent) {
      this.store.dispatch(new UserActions.SetSingleConversation({
        conversation: this.currConversation,
        stringMessage: form.value.messageContent ? new Message({
          creator: this.user._id,
          content: form.value.messageContent,
          createdAt: new Date()
        }) : null
      }));
    }
    this.sendMessageForm.form.patchValue({
      messageContent: ''
    });
    this.file = null;
    const filesDiv = this.renderer.nextSibling(this.textarea.nativeElement);
    if (filesDiv.firstChild) {
      filesDiv.removeChild(filesDiv.firstChild);
    }
  }

  @HostListener('document:keyup', ['$event'])
  @HostListener('document:keydown', ['$event']) onKeyDown(event) {
    if (['ControlRight', 'Enter', 'ControlLeft', 'NumpadEnter'].includes(event.code)) {
      this.keyMap[event.code] = event.type === 'keydown';
    }
    if (this.textarea &&
        (this.keyMap['ControlRight'] || this.keyMap['ControlLeft']) &&
        (this.keyMap['Enter'] || this.keyMap['NumpadEnter'])) { // CTRL+ENTER
      this.submitChat.nativeElement.click();
    }
  }

  onFucosCon(conversationDiv: ElementRef) {
    this.file = null;
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

  uploadFile() {
    this.inputUploadFile.nativeElement.click();
  }

  onChoseFile(event) {
    this.file = event.target.files[0];
    const divFile = this.renderer.createElement('div');
    const fileName = this.renderer.createElement('span');
    const fileSize = this.renderer.createElement('span');
    const remove = this.renderer.createElement('span');
    fileName.innerText = this.file.name;
    fileSize.innerText = this.getFileSize(this.file.size);
    this.renderer.appendChild(divFile, fileName);
    this.renderer.appendChild(divFile, fileSize);
    this.renderer.appendChild(divFile, remove);

    this.renderer.addClass(divFile, 'file-message-container');
    this.renderer.addClass(remove, 'glyphicon');
    this.renderer.addClass(remove, 'glyphicon-remove');
    this.renderer.appendChild(this.renderer.nextSibling(this.textarea.nativeElement), divFile);
    this.renderer.listen(remove, 'click', this.removeFile.bind(this));
  }

  removeFile(event) {
    const fileCon = this.renderer.parentNode(event.target);
    const uploadCon = this.renderer.parentNode(fileCon);
    this.renderer.removeChild(uploadCon, fileCon);
    this.file = null;
  }

  getFileSize = bytes => {
    const kb = Math.floor(bytes / 1000);
    if (kb < 1000) {
      return kb + ' Kb';
    }
    const mb = Math.floor(kb / 1000);
    if (mb < 1000) {
      return mb + ' Mb';
    }
    const gb = Math.floor(mb / 1000);
    return gb + ' Gb';
  }

  getFullName(user: { _id: string; name?: string; firstName?: string; lastName?: string; }) {
    return user['name'] ? user['name'] :
          ((user['firstName'] || '') + ' ' + (user['lastName'] || '')).trim();
  }

  onClose() {
    this.messages = [];
  }

  onNewMessage(privateMsg: boolean) {
    this.file = null;
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

