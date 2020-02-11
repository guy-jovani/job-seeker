import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class DetailsCompanyComponent implements OnInit, OnDestroy {
  companySub: Subscription;
  authSub: Subscription;
  routeSub: Subscription;
  company: Company;
  // index: number;
  allowEdit: boolean;
  // user: Company;
  isLoading = false;

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    let currUrl;
    this.routeSub = this.route.params.pipe(
      switchMap(() => {
        currUrl = this.route.snapshot['_routerState'].url.substring(1).split('/');
        if (currUrl[0] === 'my-details') {
          return this.store.select('auth');
        } else {
          return this.store.select('company');
        }
      }))
      .subscribe(currState => {
        if (currUrl[0] === 'my-details') {
          this.company = currState['user'] as Company;
          this.allowEdit = true;
        } else { // company list details
          this.isLoading = currState['loadingSingle'];
          if (currUrl[1] >= currState['companies'].length || currUrl[1] < 0) {
            // check if trying to get details of an undefined employee
            return this.router.navigate(['companies']);
          }
          this.company = currState['companies'][+currUrl[1]];
          this.allowEdit = false;
        }
      });
  }

  ngOnDestroy() {
    if (this.companySub) {
      this.companySub.unsubscribe();
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }
}
