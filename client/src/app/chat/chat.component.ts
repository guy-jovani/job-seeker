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
import { Participant } from './participant.model';
import { environment } from 'environments/environment';
import { AngularFireStorage } from '@angular/fire/storage';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  user: Employee | Company = null;
  nameList: Map<string, { _id: string, fullName: string, type: string, email: string, nameColor?: SafeStyle }> = null;
  messages: string[] = [];
  privateMsg = true;
  userKind: string = null;
  conversations: Conversation[] = null;
  conversationDiv: ElementRef = null;
  currConversation: Conversation = null;
  isLoading = false;
  keyMap = {};
  file: File;
  errorFile: boolean = null;
  uploadFilePercent: number;
  production = environment.production;

  @ViewChild('sendMessageForm') sendMessageForm: NgForm;
  @ViewChild('textarea') textarea: ElementRef;
  @ViewChild('conversationList') conversationList: ElementRef;
  @ViewChild('submitChat') submitChat: ElementRef;
  @ViewChild('inputUploadFile') inputUploadFile: ElementRef;

  constructor(private renderer: Renderer2,
              private chatService: ChatService,
              private sanitizer: DomSanitizer,
              private store: Store<fromApp.AppState>,
              private storage: AngularFireStorage) { }

  ngOnInit() {
    this.subscription = this.store.select('user').subscribe(userState => {
      this.user = userState.user;
      this.userKind = userState.user ? userState.kind[0].toUpperCase() + userState.kind.slice(1) : null;
      this.conversations = userState.conversations;
      this.isLoading = userState.loading;
      if (this.currConversation && this.conversations && this.user) {
        if (!this.conversations.find(con => con._id === this.currConversation._id)
              .participants.find(part => part.user._id === this.user._id).read) {
          this.chatService.sendMessage('readAMsg', { // mark con as 'read'
            conversationId: this.currConversation._id, userId: this.user._id
          });
        }
        this.currConversation = this.conversations.find(con => con._id === this.currConversation._id);
      }
    });
    if (this.conversations.length) {
      this.store.dispatch(new UserActions.RemoveChatNotification());
    }
    this.nameList = new Map<string, { _id: string, fullName: string, type: string, email: string, nameColor?: SafeStyle }>();
  }

  onGetNames(nameList: Map<string, { _id: string, fullName: string, type: string, email: string, nameColor?: SafeStyle }>) {
    this.nameList = nameList;
  }

  // tslint:disable-next-line: variable-name
  onRemoveName(_id: string) {
    this.nameList.delete(_id);
  }

  async onSubmit(form: NgForm) {
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

    if (this.file) { // update conversation in server - file
      let fileFBUrl: string;
      if (this.production) {
        fileFBUrl = await this.uploadProductionFile();
      }

      this.chatService.sendMessage('postAMsg', {
        ownerId: this.user._id,
        senderId: this.user._id,
        senderType: this.userKind,
        content: null,
        file: this.production ? fileFBUrl : this.file,
        fileName: this.file.name,
        fileNumBytes: this.file.size,
        privateMsg: this.privateMsg,
        recipients: Array.from(this.nameList.keys()).map(key => {
          const nameObj = this.nameList.get(key);
          return { _id: nameObj._id, type: nameObj.type };
        })
      });
    }

    if (form.value.messageContent) { // update conversation in server - string
      this.chatService.sendMessage('postAMsg', {
        ownerId: this.user._id,
        senderId: this.user._id,
        senderType: this.userKind,
        content: form.value.messageContent,
        file: null,
        newMessage: !this.currConversation,
        privateMsg: this.privateMsg,
        recipients: Array.from(this.nameList.keys()).map(key => {
          const nameObj = this.nameList.get(key);
          return { _id: nameObj._id, type: nameObj.type };
        })
      });
    }


    // locally update the conversation - only for string message
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

    // cleanup
    this.sendMessageForm.form.patchValue({
      messageContent: ''
    });
    this.file = null;
    if (!this.currConversation) {
      this.nameList.clear();
    }
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

  onFocusCon(conversationDiv: ElementRef) {
    this.file = null; // reset the file in case the user changed conversations
    if (this.conversationDiv) { // if the user had an active conversation => deactivate it
      this.renderer.removeClass(this.conversationDiv, 'active-con');
    }
    this.conversationDiv = conversationDiv; // the container of the new curr conversation
    this.renderer.addClass(this.conversationDiv, 'active-con');
    this.currConversation = this.conversations[this.conversationDiv['attributes']['data-con-ind'].value];
    this.chatService.sendMessage('readAMsg', { // mark con as 'read'
      conversationId: this.currConversation._id, userId: this.user._id
    });

    this.nameList.clear(); // reset the nameList for the curr conversation
    for (const participant of this.currConversation.participants) {
      if (participant.user._id === this.user._id) { // if the participant is the curr user then skip
        continue;
      }
      this.nameList.set(participant['user']['_id'], {
                  _id: participant['user']['_id'],
                  fullName: this.getFullName(participant.user),
                  type: participant['type'],
                  email: participant['email']
      });

      const participantNameList = this.nameList.get(participant.user._id);
      if (participantNameList) {
        this.nameList.set(participant.user._id, { ...participantNameList,
          nameColor: this.sanitizer.bypassSecurityTrustStyle(`rgb(\
            ${(Math.floor(Math.random() * 255))},${(Math.floor(Math.random() * 128))},\
            ${(Math.floor(Math.random() * 255))})`)});
      }
    }
    this.privateMsg = this.currConversation.participants.length === 2;
  }

  uploadFile() {
    this.inputUploadFile.nativeElement.click();
  }

  getParticipantsOtherThanUser(participants: Participant[]) {
    return participants.filter(part => part.user._id !== this.user._id);
  }

  getReadClass(participants: Participant[]) {
    return participants.find(part => part.user._id === this.user._id)['read'] ? 'read' : 'unread';
  }

  onChoseFile(event) {
    this.file = event.target.files[0];
    this.uploadFilePercent = 0;
    if (this.file.size >= 500000) {
      this.errorFile = true;
      this.file = null;
    } else {
      this.errorFile = false;
    }
  }

  private async uploadProductionFile() {
    let fileFBUrl: string;
    if (this.file) {
      const uniqueName = this.getImageUniqueName(this.file.name);
      fileFBUrl = await this.fireBaseUpload(this.file, uniqueName);
      return fileFBUrl;
    }
    return null;
  }

  private getImageUniqueName(name: string) {
    return name.split('.')[0] + '-' +
      new Date().toISOString().replace(/:/g, '-') + '.' +
      name.split('.')[1];
  }

  async fireBaseUpload(file: File, name: string) {
    if (file) {
      const fileRef = this.storage.ref(environment.filesFolder + name);
      const task = this.storage.upload(environment.filesFolder + name, file);

      task.percentageChanges().subscribe(pre => {
        this.uploadFilePercent = pre;
        console.log(pre)
      });

      await task.snapshotChanges().toPromise();
      return await fileRef.getDownloadURL().toPromise();
    }
  }

  removeFile() {
    this.errorFile = false;
    this.file = null;
  }

  trackConversations(index: number, con: Conversation) {
    return index;
  }

  getFileSize = bytes => {
    const kb = Math.floor(bytes / 1024);
    if (kb < 1024) {
      return kb + ' Kb';
    }
    const mb = Math.floor(kb / 1024);
    if (mb < 1024) {
      return mb + ' Mb';
    }
    const gb = Math.floor(mb / 1024);
    return gb + ' Gb';
  }

  getFullName(user: { _id: string; email?: string; name?: string; firstName?: string; lastName?: string; }) {
    if (user['name']) {
      return user['name'];
    } else if (user['firstName'] || user['lastName']) {
      return ((user['firstName'] || '') + ' ' + (user['lastName'] || '')).trim();
    }
    return user.email;
  }

  onClose() {
    this.messages = [];
  }

  getRelativeFilePath(path: string) {
    // {{getRelativeFilePath(msg.filePath)}}
    return path.split('/').slice(3).join('/');
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

