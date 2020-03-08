import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import * as CompanyActions from '../store/company.actions';
import * as PositionActions from '../../position/store/position.actions';
import { Company } from '../company.model';
import * as fromApp from '../../store/app.reducer';
import { Store } from '@ngrx/store';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-details-company',
  templateUrl: './details-company.component.html',
  styleUrls: ['./details-company.component.scss']
})
export class DetailsCompanyComponent implements OnInit, OnDestroy  {
  routeSub: Subscription;
  company: Company = null;
  allowEdit: boolean;
  isLoading = false;
  mainUrl: string;
  currUrl: string[] = null;
  errorMessages: string[] = [];

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute,
              private router: Router,
              private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.routeSub = this.route.params.pipe(
      switchMap(() => {
        this.currUrl = this.router.url.substring(1).split('/');
        this.mainUrl = this.currUrl[0];
        if (this.currUrl[0] === 'my-details') {
          return this.store.select('user');
        } else if (this.currUrl[0] === 'companies') {
          return this.store.select('company');
        } else {
          return this.store.select('position');
        }
      }))
      .subscribe(currState => {
        this.currUrl = this.router.url.substring(1).split('/');
        this.isLoading = currState['loadingSingle'];
        if (this.currUrl[0] === 'my-details') {
          this.company = currState['user'] as Company;
          this.allowEdit = true;
        } else if (this.currUrl[0] === 'companies') {
          if (this.invalidStateListInd(currState, 'companies')) { return; }
          this.company = currState['companies'][+this.currUrl[1]];
          this.allowEdit = false;
        } else { // positions
          if (this.invalidStateListInd(currState, 'positions')) { return; }
          if (this.currUrl[this.currUrl.length - 1] === 'company') {
            if (currState.messages) {
              this.errorMessages = [];
              for (const msg of currState.messages) {
                this.errorMessages.push(msg);
              }
            } else {
              this.errorMessages = [];
            }
          }
          this.allowEdit = false;
          this.company = !currState['positions'] ? null : currState['positions'][+this.currUrl[1]]['companyId'];
          if (!this.company.email) { this.errorMessages = ['There was an error fetching the company']; }
        }
        this.ref.detectChanges();
      });
  }

  onClose() {
    this.store.dispatch(new CompanyActions.ClearError());
    this.store.dispatch(new PositionActions.ClearError());
  }

  private invalidStateListInd(currState, list) {
    if (this.currUrl[1] >= currState[list].length || +this.currUrl[1] < 0) {
      this.router.navigate([this.currUrl[0]]);
      return true;
    }
    return false;
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
    this.onClose();
  }
}
