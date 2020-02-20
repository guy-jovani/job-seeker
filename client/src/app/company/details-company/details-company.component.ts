import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';


import { Company } from '../company.model';
import * as fromApp from '../../store/app.reducer';
import { Store } from '@ngrx/store';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-details-company',
  templateUrl: './details-company.component.html',
  styleUrls: ['./details-company.component.css']
})
export class DetailsCompanyComponent implements OnInit, OnDestroy, AfterViewChecked  {
  routeSub: Subscription;
  company: Company = null;
  allowEdit: boolean;
  isLoading = false;
  mainUrl: string;
  currUrl: string[] = null;

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute,
              private router: Router,
              private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.routeSub = this.route.params.pipe(
      switchMap(() => {
        this.currUrl = this.route.snapshot['_routerState'].url.substring(1).split('/');
        this.mainUrl = this.currUrl[0];
        if (this.currUrl[0] === 'my-details') {
          return this.store.select('auth');
        } else if (this.currUrl[0] === 'companies') {
          return this.store.select('company');
        } else {
          return this.store.select('position');
        }
      }))
      .subscribe(currState => {
        this.isLoading = currState['loadingSingle'];
        if (this.currUrl[0] === 'my-details') {
          this.company = currState['user'] as Company;
          this.allowEdit = true;
        } else if (this.currUrl[0] === 'companies') {
          if (this.invalidStateListInd(this.currUrl, currState, 'companies')) { return; }
          this.company = currState['companies'][+this.currUrl[1]];
          this.allowEdit = false;
        } else { // positions
          if (this.invalidStateListInd(this.currUrl, currState, 'positions')) { return; }
          this.allowEdit = false;
          this.company = currState['tempCompany'];
          this.company = !currState['positions'] ? null : currState['positions'][+this.currUrl[1]]['companyId'];
        }
        this.ref.detectChanges();
      });
  }

  ngAfterViewChecked() {
    if (!this.company.positions && !this.isLoading) {
      this.router.navigate([this.currUrl[0]]);
    }
  }

  private invalidStateListInd(currUrl, currState, list) {
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
  }
}
