import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { Subscription } from 'rxjs';
import * as fromApp from '../../store/app.reducer';
import { Employee } from '../employee.model';
import * as EmployeeActions from '../store/employee.actions';
import { Company, ApplicantPosition, ApplicantStatus } from 'app/company/company.model';
import * as UserActions from '../../user/store/user.actions';

@Component({
  selector: 'app-details-employee',
  templateUrl: './details-employee.component.html',
  styleUrls: ['./details-employee.component.scss']
})
export class DetailsEmployeeComponent implements OnInit, OnDestroy {
  employee: Employee;
  routeSub: Subscription;
  allowEdit: boolean;
  user: Company = null; // only used for company applicants. /my-applicants/:index
  applicantPositions: ApplicantPosition[] = null; // only used for company's applicant positions. /my-applicants/:index
  isLoading = false;
  messages: string[] = [];
  currUrl: string[] = null;
  selctedStatusList = 'all';
  availableStatus = Object.keys(ApplicantStatus).filter(key => isNaN(+key));

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.routeSub = this.route.params
      .pipe(
        switchMap(() => {
          this.currUrl = this.router.url.substring(1).split('/');
          if (this.currUrl[0] === 'my-details' || this.currUrl[0] === 'my-applicants') {
            return this.store.select('user');
          } else {
            return this.store.select('employee');
          }
        }))
        .subscribe(currState => {
          this.currUrl = this.router.url.substring(1).split('/');
          if (currState.messages) {
            this.messages = [];
            for (const msg of currState.messages) {
              this.messages.push(msg);
            }
          } else {
            this.messages = [];
          }
          this.isLoading = currState['loadingSingle'] || currState['loading'];
          if (this.currUrl[0] === 'my-details') {
            if (!currState['user']) { return; }
            this.employee = currState['user'] as Employee;
            this.allowEdit = true;
          } else if (this.currUrl[0] === 'my-applicants') {
            if (!currState['user']) { return; }
            this.user = currState['user'];
            const applicant = this.user.applicants[+this.currUrl[1]];
            this.employee = applicant['employee'];
            this.applicantPositions = applicant['positions'];
          } else {
            if (this.invalidStateListInd(currState, 'employees')) { return; }
            this.employee = currState['employees'][+this.currUrl[1]];
            this.allowEdit = false;
          }
        });
  }

  onAcceptReject(status: ApplicantStatus, posInd: number) {
    this.store.dispatch(new UserActions.CompanyAcceptRejectPositionAttempt({
      positionId: this.applicantPositions[posInd].position._id, status: status.toString(),
      employeeId: this.employee._id, state: this.currUrl[0]
    }));
  }

  private invalidStateListInd(currState, list) {
    if (this.currUrl[1] >= currState[list].length || +this.currUrl[1] < 0) {
      this.router.navigate(['employees']);
      return true;
    }
    return false;
  }

  checkPositionOfUser() {
    if (this.selctedStatusList === 'all') {
      this.applicantPositions = this.user.applicants[+this.currUrl[1]].positions;
    } else {
      this.applicantPositions = this.user.applicants[+this.currUrl[1]].positions
            .filter(pos => pos.status.toString() === this.selctedStatusList);
    }
  }

  onClose() {
    if ((this.currUrl[0] === 'my-details' || this.currUrl[0] === 'my-applicants')) {
      this.store.dispatch(new UserActions.ClearError());
    } else {
      this.store.dispatch(new EmployeeActions.ClearError());
    }
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    this.onClose();
  }
}
