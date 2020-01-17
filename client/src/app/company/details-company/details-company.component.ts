import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Company } from '../company.model';
import * as fromApp from '../../store/app.reducer';
import { Store } from '@ngrx/store';
import { Employee } from 'app/employees/employee.model';
import * as CompanyActions from '../store/company.actions';

@Component({
  selector: 'app-details-company',
  templateUrl: './details-company.component.html',
  styleUrls: ['./details-company.component.css']
})
export class DetailsCompanyComponent implements OnInit, OnDestroy {
  companySub: Subscription;
  authSub: Subscription;
  paramSub: Subscription;
  company: Company;
  // index: number;
  allowEdit: boolean;
  // user: Company;

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.paramSub = this.route.params.subscribe(params => {
      const currUrl = this.route.snapshot['_routerState'].url.substring(1).split("/");
      if(currUrl[0] === 'my-details'){
        this.authSub = this.store.select('auth').subscribe(authState => {
          this.company = <Company> authState.user;
          this.allowEdit = true;
        });
      } else {
        this.companySub = this.store.select('company')
        .subscribe(companyState => {
          if(currUrl[1] >= companyState.companies.length || currUrl[1] < 0){
            return this.router.navigate(['companies']);
          } 
          this.company = companyState.companies[+currUrl[1]];
          this.allowEdit = false;
        })
      }
    });
  }

  ngOnDestroy(){
    if(this.companySub){
      this.companySub.unsubscribe();
    }
    if(this.authSub){
      this.authSub.unsubscribe();
    }
    if(this.paramSub){
      this.paramSub.unsubscribe();
    }
  }
}
