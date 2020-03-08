import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';

import * as CompanyActions from '../../company/store/company.actions';
import * as PositionActions from '../../position/store/position.actions';
import * as fromApp from '../../store/app.reducer';
import { Position } from '../position.model';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'environments/environment';



@Component({
  selector: 'app-details-position',
  templateUrl: './details-position.component.html',
  styleUrls: ['./details-position.component.css']
})
export class DetailsPositionComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  position: Position;
  allowEdit = false;
  isLoading = false;
  currUrl: string[] = null;
  companyLink = true;
  errorMessages: string[] = [];

  @Input() companyPosition: Position = null;

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.subscription = this.route.params.pipe(
      switchMap(params => {
        this.currUrl = this.router.url.substring(1).split('/');
        if (this.currUrl[0] === 'my-positions') {
          return this.store.select('user');
        } else if ( this.currUrl[0] === 'companies') {
          return this.store.select('company');
        } else {
          return this.store.select('position');
        }
      })
      ).subscribe(currState => {
        this.currUrl = this.router.url.substring(1).split('/');
        this.isLoading = currState['loadingSingle'];
        if (this.currUrl[0] === 'my-positions') {
          if (currState['kind'] === 'company') {
            this.allowEdit = true;
          }
          this.position = currState['user'] ? currState['user'].positions[+this.currUrl[1]] : null;
        } else if (this.currUrl[0] === 'positions') { // /positions/:posInd
          this.checkPositionsUrl(currState);
        } else { // /companies/:compInd/position
          this.checkCompaniesUrl(currState);
        }
      });
  }

  private checkCompaniesUrl(currState) {
    if (this.invalidStateListInd(currState, 'companies')) { return; }
    this.companyLink = false;
    this.position = !currState['companies'] ? null :
    currState['companies'][+this.currUrl[1]]['positions'][window.history.state['positionInd']];
    if (!this.position) {
      this.router.navigate([this.currUrl[0]]);
    }
  }

  private checkPositionsUrl(currState) {
    if (this.invalidStateListInd(currState, 'positions')) { return; }
    if (this.currUrl[this.currUrl.length - 1] === 'position') {
      if (currState.messages) {
        this.errorMessages = [];
        for (const msg of currState.messages) {
          this.errorMessages.push(msg);
        }
      } else {
        this.errorMessages = [];
      }
    }
    if (this.currUrl[this.currUrl.length - 1] === 'position') {
      this.companyLink = false;
      if (!currState['positions']) {
        this.router.navigate([this.currUrl[0]]);
      } else { // /positions/:posInd/company/position
        if (window.history.state['positionInd'] === undefined) {
          return this.router.navigate([this.currUrl[0]]);
        }
        const positions = currState['positions'];
        const position = positions[+this.currUrl[1]];
        const company = position['companyId'];
        const companyPositions = company['positions'];
        this.position = companyPositions[window.history.state['positionInd']];
        this.position.companyId = {
          _id: companyPositions[window.history.state['positionInd']].companyId,
          name: company.name
        };
      }
    } else { // /positions/:posInd/company
      this.position = currState['positions'] ? currState['positions'][+this.currUrl[1]] : null;
    }
  }

  private invalidStateListInd(currState, list) {
    if (this.currUrl[1] >= currState[list].length || +this.currUrl[1] < 0) {
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
    if (this.currUrl[0] === 'companies') {
      // the only errors that can be catched here are of a company
      // the others will be catched in a different/prev component
      this.store.dispatch(new CompanyActions.ClearError());
    }
  }

  getCompanyinfo() {
    if (this.currUrl.length === 2 && this.currUrl[0] === 'positions' && (!this.position.companyId.lastFetch ||
        new Date().getTime() - this.position.companyId.lastFetch.getTime() > environment.fetchDataMSReset )) {
      this.store.dispatch(new PositionActions.UpdateSinglePositionCompanyAttempt());
      this.store.dispatch(new CompanyActions.FetchSingleCompany({
        _id: this.position.companyId._id, main: false, posInd: +this.currUrl[1]
      }));
    }
  }

}
