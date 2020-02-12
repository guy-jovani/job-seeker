import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import * as fromApp from '../../store/app.reducer';
import * as EmployeeActions from '../store/employee.actions';
import { Employee } from '../employee.model';


@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.css']
})
export class EditEmployeeComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  errorMessages: string[];
  errorSub: Subscription;

  @ViewChild('employeeForm', {static: true}) employeeForm: NgForm;
  @ViewChild('email', {static: true, read: ElementRef}) emailInput: ElementRef;

  constructor(
    private store: Store<fromApp.AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.initForm();
    this.errorSub = this.store.select('employee')
      .subscribe(
        employeeState => {
          this.emailInput.nativeElement.focus();
          this.emailInput.nativeElement.blur();
          if (employeeState.messages) {
            for (const msg of employeeState.messages) {
              this.errorMessages.push(msg);
            }
          } else {
            this.errorMessages = [];
          }
        }
      );
  }

  initForm() {
    setTimeout(() => {
      this.subscription = this.store.select('auth')
        .pipe(
          map(authState => authState.user )
        )
        .subscribe((user: Employee) => {
          if (user) {
            this.employeeForm.form.setValue({
              email: user.email,
              _id: user._id,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
            });
          }
        });
    }, 0);
  }

  onSubmit(form: NgForm) {
    const firstName = form.value.firstName ? form.value.firstName : undefined;
    const lastName = form.value.lastName ? form.value.lastName : undefined;
    const newEmployee = new Employee({
      _id: form.value._id, email: form.value.email
    });
    if (firstName) {
      newEmployee.firstName = firstName;
    }
    if (lastName) {
      newEmployee.lastName = lastName;
    }
    this.store.dispatch(new EmployeeActions.UpdateSingleEmployeeInDB(newEmployee));
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onDelete() {
    // this.store.dispatch(new EmployeeActions.DeleteEmployeeFromDB(this.index));
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.errorSub) {
      this.errorSub.unsubscribe();
    }
  }

  onClose() {
    this.store.dispatch(new EmployeeActions.ClearError());
  }
}
