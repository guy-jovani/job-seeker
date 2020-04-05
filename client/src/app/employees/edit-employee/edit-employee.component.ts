import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
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
  styleUrls: ['./edit-employee.component.scss']
})
export class EditEmployeeComponent implements OnInit, OnDestroy {
  userSub: Subscription;
  isLoading = false;
  employeeForm: FormGroup;
  employee: Employee;
  showPasswords = false;
  messages: string[] = [];
  currUrl: string[] = null;
  profileImage: { file: File, stringFile: string } = { file: null, stringFile: '' };

  @ViewChild('deleteImage') deleteImage: ElementRef;

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

    this.userSub = this.store.select('user').pipe(
      switchMap(userState => {
        this.employee = userState.user as Employee;
        return this.store.select('employee');
      }))
      .subscribe(
        employeeState => {
          this.currUrl = this.router.url.substring(1).split('/');
          this.isLoading = employeeState.loadingSingle;
          if (employeeState.messages) {
            this.messages = [];
            for (const msg of employeeState.messages) {
              this.messages.push(msg);
            }
          } else {
            this.messages = [];
          }
          if (this.employee) {
            this.initForm();
          }
      });
  }

  checkPasswordEquality(control: FormControl): {[s: string]: boolean} {
    if (control.get('password').value !== control.get('confirmPassword').value) {
      return { equality: true };
    }
    return null;
  }

  onCroppedEvent(images: { file: File, stringFile: string }) {
    this.profileImage = images;
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

    if (this.employee.profileImagePath) {
      this.profileImage = { file: null, stringFile: this.employee.profileImagePath as string };
    }
  }

  onSubmit(form: FormGroup) {
    if (form.invalid) {
      return this.store.dispatch(new EmployeeActions.EmployeeOpFailure(['The form is invalid']));
    }
    const firstName = form.value.firstName ? form.value.firstName : undefined;
    const lastName = form.value.lastName ? form.value.lastName : undefined;
    const password = form.value.passwords.password ? form.value.passwords.password : undefined;
    const confirmPassword = form.value.passwords.confirmPassword ? form.value.passwords.confirmPassword : undefined;

    const newEmployee = new Employee({
      _id: this.employee._id, email: form.value.email
    });
    if (firstName) { newEmployee.firstName = firstName; }
    if (lastName) { newEmployee.lastName = lastName; }
    if ( this.profileImage.file ) { newEmployee.profileImagePath = this.profileImage.file; }
    this.store.dispatch(new EmployeeActions.UpdateSingleEmployeeInDB({
              employee: newEmployee, deleteImage: this.deleteImage.nativeElement.checked,
              password, confirmPassword }));
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    this.onClose();
  }

  onClose() {
    this.store.dispatch(new EmployeeActions.ClearError());
  }

  onTogglePasswords() {
    this.showPasswords = !this.showPasswords;
  }
}
