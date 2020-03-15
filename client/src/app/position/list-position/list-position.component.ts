import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Position } from '../position.model';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';

import * as PositionActions from '../store/position.actions';
import * as fromApp from '../../store/app.reducer';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Employee, EmployeePositionStatus } from 'app/employees/employee.model';
import { Company } from 'app/company/company.model';
import { State as UserState } from 'app/user/store/user.reducer';


@Component({
  selector: 'app-list-position',
  templateUrl: './list-position.component.html',
  styleUrls: ['./list-position.component.scss']
})
export class ListPositionComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  positions: Employee['positions'] | Position[];
  allowAdd = false;
  currUrl: string[] = null;
  isLoading = false;
  user: Employee | Company = null;
  kind: string = null;
  messages: string[] = [];
  selectedList = 'all';
  detailsPositionUrl = '';
  availableStatus = Object.keys(EmployeePositionStatus).filter(key => isNaN(+key));
  @Input() companyPositions: Position[] = null;

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute,
    private router: Router
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
        } else {
          if (this.companyPositions) { // companies/:companyId || /positions/:posId/company
            this.checkPositionOfACompany();
          } else { // /positions
            this.checkPositionFromPositionsState(currState);
          }
        }
    });
  }

  private checkPositionOfUser() {
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

  private checkPositionOfACompany() {
    this.positions = this.companyPositions;
  }

  private checkPositionFromPositionsState(positionState) {
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
