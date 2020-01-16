import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Company } from '../company.model';
import * as fromApp from '../../store/app.reducer';
import { Store } from '@ngrx/store';
import { map, switchMap } from 'rxjs/operators';
import { Employee } from 'app/employees/employee.model';

@Component({
  selector: 'app-details-company',
  templateUrl: './details-company.component.html',
  styleUrls: ['./details-company.component.css']
})
export class DetailsCompanyComponent implements OnInit, OnDestroy {
  companySub: Subscription;
  authSub: Subscription;
  company: Company;
  index: number;
  allowEdit: boolean;
  user: Employee | Company;
  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit() {
    this.authSub = this.store.select('auth').subscribe(authState => {
      this.user = authState.user;
    });

    this.companySub = this.store.select('company')
      .subscribe(
        companyState => {
          const currUrl = this.route.snapshot['_routerState'].url.substring(1).split("/");
          // if(currUrl[0] === 'my-details'){
          //   this.company = companyState.companies
          //     .filter(company => company.creatorId === this.activeEmp._id)[currUrl[1]];
          // } else {
            if(currUrl[1] >= companyState.companies.length || currUrl[1] < 0){
              return this.router.navigate(['companies']);
            } 
            this.company = companyState.companies[currUrl[1]];
          // }s
          // this.allowEdit = this.activeEmp._id === this.company.creatorId;
        }
    );
  }

  ngOnDestroy(){
    if(this.companySub){
      this.companySub.unsubscribe();
    }
    if(this.authSub){
      this.authSub.unsubscribe();
    }
  }
}
