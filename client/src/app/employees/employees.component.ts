import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef, HostListener, AfterViewChecked } from '@angular/core';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Employee } from './employee.model';
import { ApplicantPosition } from 'app/company/company.model';

import * as fromApp from '../store/app.reducer';
import * as EmployeeActions from './store/employee.actions';

@Component({
  selector: 'app-empolyees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, OnDestroy, AfterViewChecked {
  employees: Employee[] | { positions: ApplicantPosition[], employee: Employee }[];
  subscription: Subscription;
  isLoading = false;
  applicantsList = false;
  messages: string[] = [];
  currUrl: string[] = null;
  lastEmployee: boolean; // if there are more employees to fetch
  page: number;

  @ViewChild('containerFluid') containerFluid: ElementRef;

  constructor(private store: Store<fromApp.AppState>,
              private route: ActivatedRoute,
              private ref: ChangeDetectorRef,
              private router: Router) { }

  ngOnInit() {
    this.subscription = this.route.params.pipe(
      switchMap(() => {
        this.currUrl = this.router.url.substring(1).split('/');
        if (this.currUrl[0] === 'my-applicants') {
          return this.store.select('user');
        } else {
          return this.store.select('employee');
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
        if (this.currUrl[0] === 'my-applicants') {
          this.isLoading = currState['loading'];
          this.applicantsList = true;
          this.employees = currState['user'] ? currState['user'].applicants : null;

        } else { // /employees
          this.page = currState['page'];
          this.isLoading = currState['loadingAll'];
          this.employees = currState['employees'];
          this.lastEmployee = this.employees.length === currState['total'];
        }
      });
  }

  private fetchNextPage() {
    const container = this.containerFluid.nativeElement.getBoundingClientRect();
    if (!this.isLoading && // won't fetch in a middle of a fetch
        !this.lastEmployee && // won't fetch if the last employee was fetched
        (container.bottom <= window.innerHeight || // if the whole list is shown - so fetch
        container.height - window.pageYOffset < window.innerHeight)) { // check if scrolled to the container
      this.store.dispatch(new EmployeeActions.FetchEmployees({ page: this.page }));
      this.ref.detectChanges();
    }
  }

  ngAfterViewChecked() {
    this.fetchNextPage();
  }

  @HostListener('window:scroll', ['$event']) doSomething(event) {
    this.fetchNextPage();
  }

  onClose() {
    this.store.dispatch(new EmployeeActions.ClearError());
    }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.onClose();
  }

}
