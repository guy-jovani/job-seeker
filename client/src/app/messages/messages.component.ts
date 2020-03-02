import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';

import * as fromApp from '../store/app.reducer';
import { Subscription } from 'rxjs';
import { Employee } from 'app/employees/employee.model';
import { Company } from 'app/company/company.model';
import { environment } from 'environments/environment';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  user: Employee | Company = null;
  nameList: {_id: number, fullName: string, type: string}[] = null;
  errorMessages: string[] = [];
  privateMsg = true;
  chat = false;

  @ViewChild('newConversationForm', { static: false }) newConversationForm: NgForm;

  constructor(private http: HttpClient,
              private store: Store<fromApp.AppState>) { }

  ngOnInit() {
    this.subscription = this.store.select('auth').subscribe(authState => {
      this.user = authState.user;
    });
    this.nameList = [];
  }

  onGetNames(nameList: {_id: number, fullName: string, type: string}[]) {
    this.nameList = nameList;
  }

  onRemoveName(ind: number) {
    this.nameList.splice(ind, 1);
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      this.errorMessages.push('You can\'t send an empty message.');
    }
    if (!this.nameList.length) {
      this.errorMessages.push('You need to choose who to send the message to.');
    }
    if (this.errorMessages.length) {
      return;
    }
    const nodeServer = environment.nodeServer + 'messages/';
    this.http.post(nodeServer,
      {
        senderId: this.user._id,
        senderType: this.user instanceof Employee ? 'Employee' : 'Company',
        message: form.value.messageContent,
        privateMsg: this.privateMsg,
        recipients: this.nameList.map(val => {
          return { _id: val._id, type: val.type };
        })
      })
    .pipe(take(1))
    .subscribe(
      res => {
        if (res['type'] === 'success') {
          this.newConversationForm.resetForm();
          this.nameList.splice(0);
        } else {
          this.errorMessages.push(...res['messages']);
        }
      },
      errorMessages => {
        this.errorMessages.push(...errorMessages);
      }
    );
  }

  onClose() {
    this.errorMessages = [];
  }

  onNewMessage(privateMsg: boolean) {
    this.privateMsg = privateMsg;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

