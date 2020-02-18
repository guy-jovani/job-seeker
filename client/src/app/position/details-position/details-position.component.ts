import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';

import * as CompanyActions from '../../company/store/company.actions';
import * as fromApp from '../../store/app.reducer';
import { Position } from '../position.model';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';



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
  currUrl: string = null;
  companyLink = true;

  @Input() companyPosition: Position = null;

  constructor(
    private store: Store<fromApp.AppState>,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.subscription = this.route.params.pipe(
      switchMap(params => {
        this.currUrl = this.route.snapshot['_routerState'].url.substring(1).split('/');
        if (this.currUrl[0] === 'my-positions') {
          return this.store.select('auth');
        } else {
          return this.store.select('position');
        }
      })
      ).subscribe(currState => {
        this.isLoading = currState['loadingSingle'];
        if (this.currUrl[0] === 'my-positions') {
          if (currState['kind'] === 'company') {
            this.allowEdit = true;
          }
          this.position = currState['user'] ? currState['user'].positions[+this.currUrl[1]] : null;

        } else if (this.currUrl[0] === 'positions' && this.currUrl.length < 4) {
          this.position = currState['positions'] ? currState['positions'][+this.currUrl[1]] : null;

        } else { // url - companies/:companyInd/position
          this.companyLink = false;
          this.position = currState['tempPosition'] ? currState['tempPosition'] : null;
        }
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getCompanyinfo() {
    this.store.dispatch(new CompanyActions.FetchSingleCompany({
      _id: this.position.companyId._id, main: false
    }));
  }

}
