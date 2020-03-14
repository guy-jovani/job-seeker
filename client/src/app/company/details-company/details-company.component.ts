import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import * as CompanyActions from '../store/company.actions';
import * as PositionActions from '../../position/store/position.actions';
import { Company } from '../company.model';
import * as fromApp from '../../store/app.reducer';
import { Store } from '@ngrx/store';
import { switchMap } from 'rxjs/operators';
import { Position } from 'app/position/position.model';

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
  currUrl: string[] = null;
  messages: string[] = [];
  companyPositions: Position[] = null;

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute,
              private router: Router,
              private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.routeSub = this.route.params.pipe(
      switchMap(() => {
        this.currUrl = this.route.snapshot['_routerState'].url.substring(1).split('/');
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
        if (currState.messages) {
          this.messages = [];
          for (const msg of currState.messages) {
            this.messages.push(msg);
          }
        } else {
          this.messages = [];
        }
        if (this.currUrl[0] === 'my-details') {
          this.company = currState['user'] as Company;
          this.allowEdit = true;
        } else if (this.currUrl[0] === 'companies') {
          if (this.invalidStateListInd(currState, 'companies')) { return; }
          this.company = currState['companies'][+this.currUrl[1]];
          this.allowEdit = false;
        } else { // /positions:posInd/company
          if (this.invalidStateListInd(currState, 'positions')) { return; }
          this.allowEdit = false;
          this.company = !currState['positions'] ? null : currState['positions'][+this.currUrl[1]]['company'];
          if (!this.company.email) {
            this.messages = ['There was an error fetching the company'];
          }
          this.companyPositions = this.company.positions;
        }
        // this.ref.detectChanges();
        // this.ref.markForCheck();
      });
  }

  onClose() {
    if (this.currUrl[0] === 'companies') {
      this.store.dispatch(new CompanyActions.ClearError());
    } else {
      this.store.dispatch(new PositionActions.ClearError());
    }
    this.messages = [];
  }

  private invalidStateListInd(currState, list) {
    if (this.currUrl[1] >= currState[list].length || +this.currUrl[1] < 0) {
      this.router.navigate(['companies']);
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
