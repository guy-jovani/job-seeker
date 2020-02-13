import { Component, OnInit, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { NgForm, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import * as fromApp from '../../store/app.reducer';
import * as EmployeeActions from '../store/employee.actions';
import { Employee } from '../employee.model';


@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.css']
})
export class EditEmployeeComponent implements OnInit, OnDestroy {
  authState: Subscription;
  errorMessages: string[];
  isLoading = false;
  employeeForm: FormGroup;
  employee: Employee;
  showPasswords = false;

  // @ViewChild('email', {static: true, read: ElementRef}) emailInput: ElementRef;

  constructor(
    private store: Store<fromApp.AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.employeeForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      firstName: new FormControl(null, [Validators.minLength(2)]),
      lastName: new FormControl(null, [Validators.minLength(2)]),
      passwords: new FormGroup({
        password: new FormControl(null, [Validators.minLength(3)]),
        confirmPassword: new FormControl(null, [])
      }, this.checkPasswordEquality)
    });

    this.authState = this.store.select('auth').pipe(
      switchMap(authState => {
        this.employee = authState.user as Employee;
        return this.store.select('employee');
      }))
      .subscribe(
        employeeState => {
          // this.emailInput.nativeElement.focus();
          // this.emailInput.nativeElement.blur();
          this.isLoading = employeeState.loadingSingle;
          if (employeeState.messages) {
            for (const msg of employeeState.messages) {
              this.errorMessages.push(msg);
            }
          } else {
            this.errorMessages = [];
          }
          this.initForm();
      });
  }

  checkPasswordEquality(control: FormControl): {[s: string]: boolean} {
    if (control.get('password').value !== control.get('confirmPassword').value) {
      return { equality: true };
    }
    return null;
  }


  initForm() {
    this.employeeForm.setValue({
      email: this.employee.email,
      firstName: this.employee.firstName || '',
      lastName: this.employee.lastName || '',
      passwords: {
        password: '',
        confirmPassword: '',
      },
    });
  }

  onSubmit(form: NgForm) {
    const firstName = form.value.firstName ? form.value.firstName : undefined;
    const lastName = form.value.lastName ? form.value.lastName : undefined;
    const password = form.value.passwords.password ? form.value.passwords.password : undefined;
    const confirmPassword = form.value.passwords.confirmPassword ? form.value.passwords.confirmPassword : undefined;
    const newEmployee = new Employee({
      _id: this.employee._id, email: form.value.email
    });
    if (firstName) { newEmployee.firstName = firstName; }
    if (lastName) { newEmployee.lastName = lastName; }

    this.store.dispatch(new EmployeeActions.UpdateSingleEmployeeInDB({
              employee: newEmployee, password, confirmPassword }));
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onDelete() {
    // this.store.dispatch(new EmployeeActions.DeleteEmployeeFromDB(this.index));
  }

  ngOnDestroy() {
    if (this.authState) {
      this.authState.unsubscribe();
    }
  }

  onClose() {
    this.store.dispatch(new EmployeeActions.ClearError());
  }

  onTogglePasswords() {
    this.showPasswords = !this.showPasswords;
  }
}
