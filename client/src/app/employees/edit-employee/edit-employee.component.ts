import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import * as fromApp from '../../store/app.reducer';
import * as UserActions from '../../user/store/user.actions';
import { Employee } from '../employee.model';
import { environment } from 'environments/environment';
import { AngularFireStorage } from '@angular/fire/storage';


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
  messages: string[] = [];
  currUrl: string[] = null;
  profileImage: { file: File, stringFile: string } = { file: null, stringFile: '' };
  uploadProfilePercent: number;
  production = environment.production;

  @ViewChild('deleteImage') deleteImage: ElementRef;

  constructor(
    private store: Store<fromApp.AppState>,
    private router: Router,
    private route: ActivatedRoute,
    private storage: AngularFireStorage
  ) {}

  ngOnInit() {
    this.employeeForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      firstName: new FormControl(null, [Validators.minLength(2)]),
      lastName: new FormControl(null, [Validators.minLength(2)]),
    });

    this.userSub = this.store.select('user')
      .subscribe(
        userState => {
          this.employee = userState.user as Employee;
          this.currUrl = this.router.url.substring(1).split('/');
          this.isLoading = userState.loading;
          if (userState.messages) {
            this.messages = [];
            for (const msg of userState.messages) {
              this.messages.push(msg);
            }
          } else {
            this.messages = [];
          }
          if (this.employee) { // in case the user logged out
            this.initForm();
          }
      });
  }



  onCroppedEvent(images: { file: File, stringFile: string }) {
    this.profileImage = images;
    this.uploadProfilePercent = 0;
  }


  initForm() {
    this.employeeForm.setValue({
      email: this.employee.email,
      firstName: this.employee.firstName || '',
      lastName: this.employee.lastName || '',
    });

    if (this.employee.profileImagePath) {
      this.profileImage = { file: null, stringFile: this.employee.profileImagePath as string };
    }
    this.uploadProfilePercent = this.employee.profileImagePath ? 100 : null;
  }

  async onSubmit(form: FormGroup) {
    if (form.invalid) {
      return this.store.dispatch(new UserActions.UserFailure(['The form is invalid']));
    }
    const firstName = form.value.firstName ? form.value.firstName : undefined;
    const lastName = form.value.lastName ? form.value.lastName : undefined;

    const newEmployee = new Employee({
      _id: this.employee._id, email: form.value.email
    });
    if (firstName) { newEmployee.firstName = firstName; }
    if (lastName) { newEmployee.lastName = lastName; }

    if ( this.profileImage.file ) {
      newEmployee.profileImagePath = this.production ?
                await this.uploadProductionProfileImage() : this.profileImage.file;
    }


    this.store.dispatch(new UserActions.UpdateSingleEmployeeInDB({
              employee: newEmployee, deleteImage: this.deleteImage.nativeElement.checked }));
  }

  private async uploadProductionProfileImage() {
    let imageFBUrl: string;
    if (this.profileImage.file) {
      const uniqueName = this.getImageUniqueName(this.profileImage.file.name);
      imageFBUrl = await this.fireBaseUpload(this.profileImage.file, uniqueName);
      return imageFBUrl;
    } else {
      return this.profileImage.stringFile || '';
    }
  }

  private getImageUniqueName(name: string) {
    return name.split('.')[0] + '-' +
      new Date().toISOString().replace(/:/g, '-') + '.' +
      name.split('.')[1];
  }

  async fireBaseUpload(image: File, name: string) {
    if (image) {
      const fileRef = this.storage.ref(environment.imagesFolder + name);
      const task = this.storage.upload(environment.imagesFolder + name, image);

      task.percentageChanges().subscribe(pre => {
        this.uploadProfilePercent = pre;
      });

      await task.snapshotChanges().toPromise();
      return await fileRef.getDownloadURL().toPromise();
    }
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
    this.store.dispatch(new UserActions.ClearError());
  }
}
