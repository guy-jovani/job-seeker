import { Component, OnInit, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { Company } from '../company/company.model';
import { Employee, EmployeePositionStatus } from '../employees/employee.model';
import { switchMap } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import * as fromApp from '../store/app.reducer';
import * as PositionActions from './store/position.actions';
import { State as UserState } from '../user/store/user.reducer';

@Component({
  selector: 'app-position',
  templateUrl: './position.component.html',
  styleUrls: ['./position.component.scss']
})
export class PositionComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  positions: Employee['positions'] | Company['positions'];
  allowAdd = false;
  currUrl: string[] = null;
  isLoading = false;
  user: Employee | Company = null;
  kind: string = null;
  messages: string[] = [];
  selectedList = 'all';
  detailsPositionUrl = '';
  availableStatus = Object.keys(EmployeePositionStatus).filter(key => isNaN(+key));

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute,
    private router: Router,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subscription = this.route.params.pipe(
      switchMap(() => {
        this.currUrl = this.router.url.substring(1).split('/');
        if (this.currUrl[0] === 'my-positions') {
          return this.store.select('user');
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
        } else {
          this.messages = [];
        }
        if (this.currUrl[0] === 'my-positions') {
          this.kind = currState['kind'];
          this.user = (currState as UserState).user;
          this.checkPositionOfUser();
        } else { // /positions
          this.checkPositionsFromPositionsState(currState);
        }
        this.ref.detectChanges();
        this.ref.markForCheck();
    });
  }

  checkPositionOfUser() {
    this.positions = this.user ? this.user.positions : null;
    this.detailsPositionUrl = this.selectedList + '/';
    if (this.kind === 'company') {
      this.allowAdd = true;
      this.positions = this.positions as Company['positions'];
    } else {
      this.positions = this.positions as Employee['positions'];
      if (!this.positions) { return; }
      this.positions = this.selectedList === 'all' ? this.positions : this.positions.filter(pos => {
        return pos.status.toString() === this.selectedList;
      });
    }
  }

  private checkPositionsFromPositionsState(positionState) {
    this.isLoading = positionState['loadingAll'];
    this.positions = positionState['positions'];
  }

  onClose() {
    this.store.dispatch(new PositionActions.ClearError());
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.currUrl.length === 1 && this.currUrl[0] === 'positions') {
      this.onClose();
    }
  }

}
