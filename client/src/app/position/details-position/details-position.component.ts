import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';

import * as CompanyActions from '../../company/store/company.actions';
import * as PositionActions from '../../position/store/position.actions';
import * as UserActions from '../../user/store/user.actions';
import * as fromApp from '../../store/app.reducer';
import { Position } from '../position.model';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { Employee } from 'app/employees/employee.model';
import { Company } from 'app/company/company.model';
import { ChatService } from 'app/chat/chat-socket.service';



@Component({
  selector: 'app-details-position',
  templateUrl: './details-position.component.html',
  styleUrls: ['./details-position.component.scss']
})
export class DetailsPositionComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  position: Position = null;
  allowEdit = false;
  isLoading = false;
  currUrl: string[] = null;
  companyLink = true;
  messages: string[] = [];
  user: Employee | Company = null;
  allowApply: boolean;
  status: string = null;
  statusDate: string = null;
  kind: string = null;
  closedErrors = false;
  fetchedCompany = false;
  companyId: {_id: string, name: string} = null;

  @Input() companyPosition: Position = null;

  constructor(
    private store: Store<fromApp.AppState>,
    private chatService: ChatService,
    private router: Router) { }

  ngOnInit() {
    this.subscription = this.store.select('user').pipe(
      switchMap(userState => {
        this.currUrl = this.router.url.substring(1).split('/');
        this.kind = userState.kind;
        this.user = userState.user;
        if (this.currUrl[0] === 'my-positions') {
          return this.store.select('user');
        } else if (this.currUrl[0] === 'companies') {
          return this.store.select('company');
        } else {
          return this.store.select('position');
        }
      })
      ).subscribe(currState => {
        this.currUrl = this.router.url.substring(1).split('/');
        if (currState.messages) {
          this.messages = [];
          for (const msg of currState.messages) {
            this.messages.push(msg);
          }
          this.closedErrors = false;
        } else {
          this.messages = [];
        }
        this.isLoading = currState['loadingSingle'] || currState['loading'];
        if (this.currUrl[0] === 'my-positions') {
          this.checkPositionOfUser(currState);
        } else if (this.currUrl[0] === 'positions') { // /positions/:posInd..
          this.checkPositionFromPositionsState(currState);
        } else { // /companies/:compInd/position
          this.checkPositionOfACompany(currState);
        }
      });
  }

  private checkPositionOfUser(authState) {
    if (this.kind === 'employee') {
      this.companyLink = false;
      this.position = null;
      if (authState['user']) {
        if (this.currUrl[1] === 'all') {
          if (this.invalidStateListInd(authState['user'].positions, +this.currUrl[2])) { return; }
          this.position = authState['user'].positions[+this.currUrl[2]].position;
        } else {
          const positionsList = authState['user']
          .positions.filter(pos => pos.status === this.currUrl[1]);

          if (this.invalidStateListInd(positionsList, +this.currUrl[2])) { return; }
          this.position = positionsList[+this.currUrl[2]].position;
        }
        this.companyId = { _id: this.position.company._id, name: this.position.company.name };
        this.allowedApplySave();
      }
    } else {
      this.allowEdit = true;
      this.position = this.user ?
                      authState['user'].positions[+this.currUrl[2]] : null;
                      console.log(this.position)
      this.companyId = this.position ? { _id: this.position.company as string, name: this.user['name'] } : null;
    }
  }

  private checkPositionOfACompany(companyState) {
    if (this.invalidStateListInd(companyState['companies'], +this.currUrl[1])) { return; }
    this.companyLink = false;
    this.position = !companyState['companies'] ? null :
    companyState['companies'][+this.currUrl[1]]['positions'][window.history.state['positionInd']];
    if (!this.position) {
      this.messages = !this.closedErrors ? ['There was a problem fetching the position.'] : [];
    } else {
      this.companyId = { _id: this.position.company._id, name: this.position.company.name };
      this.allowedApplySave();
    }
  }

  private checkPositionFromPositionsState(positionState) {
    if (this.invalidStateListInd(positionState['positions'], +this.currUrl[1])) { return; }
    if (this.currUrl[this.currUrl.length - 1] === 'position') { // /positions/:posInd/company/position
      this.companyLink = false;

      if (window.history.state['positionInd'] === undefined) {
        // on access from url - doesn't know which position to look for
        return this.router.navigate([this.currUrl[0], this.currUrl[1]]);
      }
      const positionsList = positionState['positions'];
      const position = positionsList[+this.currUrl[1]];
      const companyOfPosition = position['company'];
      const companyPositions = companyOfPosition['positions'];
      this.position = companyPositions[window.history.state['positionInd']];
      this.companyId = { ...position.company };
    } else { // /positions/:posInd
      this.position = positionState['positions'] ? positionState['positions'][+this.currUrl[1]] : null;
      this.companyId = { _id: this.position.company._id, name: this.position.company.name };
    }
    this.allowedApplySave();
  }

  private allowedApplySave() {
    this.allowApply = this.kind === 'employee';
    if (this.allowApply) {
      const userPositionInfo = (this.user.positions as Employee['positions'])
                      .find(pos => pos.position._id === this.position._id);
      if (userPositionInfo) {
        this.status = userPositionInfo.status.toString();
        this.statusDate = this.getPositionDate(userPositionInfo.date);
      }
    }
  }

  private getPositionDate(dateStr: string | Date) {
    if (!dateStr) { return; }
    const date = new Date(dateStr);
    return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();
  }

  onApplySave(status: string) { // employee actions
    if (this.currUrl[0] === 'companies') {
      this.store.dispatch(new CompanyActions.CompanyStateLoadSingle());
    } else if (this.currUrl[0] === 'positions') {
      this.store.dispatch(new PositionActions.PositionStateLoadSingle());
    } else { // /my-positions
      this.store.dispatch(new UserActions.EmployeeApplySavePositionAttempt());
    }
    this.chatService.sendMessage('updateStatus', {
      status,
      kind: 'employee',
      positionId: this.position._id,
      companyId: this.companyId._id,
      employeeId: this.user._id,
      ownerId: this.user._id,
    });
  }

  private invalidStateListInd(list, index) {
    if (index >= list.length || index < 0) {
      // check if trying to get details of an undefined position
      this.router.navigate([this.currUrl[0]]);
      return true;
    }
    return false;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.onClose();
  }

  onClose() {
    this.closedErrors = true;
    this.messages = [];
    if (this.fetchedCompany) { return; } // in that case the effect of the apply op will handle the errors
    if (this.currUrl[0] === 'companies') {
      this.store.dispatch(new CompanyActions.ClearError());
    } else if (this.currUrl[0] === 'positions') {
      this.store.dispatch(new PositionActions.ClearError());
    } else {
      this.store.dispatch(new UserActions.ClearError());
    }
  }

  getCompanyinfo() {
    if (this.currUrl.length === 2 && this.currUrl[0] === 'positions' &&
          (!this.position.company.lastFetch || environment.fetchDataMSReset <
        new Date().getTime() - this.position.company.lastFetch.getTime())) {

      this.store.dispatch(new PositionActions.UpdateSinglePositionCompanyAttempt());
      this.store.dispatch(new CompanyActions.FetchSingleCompany({
        _id: this.position.company._id, main: false, posInd: +this.currUrl[1]
      }));
      this.fetchedCompany = true;
    }
  }

}

