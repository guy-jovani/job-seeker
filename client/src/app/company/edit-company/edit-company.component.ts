import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import {switchMap } from 'rxjs/operators';

import { Company } from '../company.model';
import * as fromApp from '../../store/app.reducer';
import * as CompanyActions from '../store/company.actions';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-edit-company',
  templateUrl: './edit-company.component.html',
  styleUrls: ['./edit-company.component.css']
})
export class EditCompanyComponent implements OnInit, OnDestroy {
  authState: Subscription;
  company: Company;
  imagePreview: string;
  companyForm: FormGroup;
  isLoading = false;
  showPasswords = false;

  constructor(
    private store: Store<fromApp.AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.companyForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      description: new FormControl(null),
      website: new FormControl(null),
      image: new FormControl(null, { asyncValidators : [mimeType]}),
      deleteImage: new FormControl(false),
      passwords: new FormGroup({
        password: new FormControl(null, [Validators.minLength(3)]),
        confirmPassword: new FormControl(null, [])
      }, this.checkPasswordEquality)
    });

    this.authState = this.store.select('auth').pipe(
      switchMap(authState => {
        this.company = authState.user as Company;
        return this.store.select('company');
      }))
      .subscribe(companyState => {
        this.isLoading = companyState.loadingSingle;
        if (this.company) {
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

  initForm() {
    this.companyForm.setValue({
      name: this.company.name,
      email: this.company.email,
      description: this.company.description || '',
      website: this.company.website || '',
      image: this.company.imagePath || '',
      passwords: {
        password: '',
        confirmPassword: '',
      },
      deleteImage: false,
    });
  }

  handleImageInput(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      this.companyForm.patchValue({ image: file });
      this.companyForm.get('image').updateValueAndValidity();
      const reader = new FileReader();
      reader.readAsDataURL(file); // read file as data url
      reader.onload = () => { // called once readAsDataURL is completed
        this.imagePreview = reader.result as string;
      };
    }
  }

  onSubmit() {
    if (this.companyForm.invalid) {
      return this.store.dispatch(new CompanyActions.CompanyOpFailure(['The form is invalid']));
    }
    const formValue = this.companyForm.value;
    const name = formValue.name;
    const email = formValue.email;
    const deleteImage = formValue.deleteImage;
    const password = formValue.passwords.password ? formValue.passwords.password : undefined;
    const confirmPassword = formValue.passwords.confirmPassword ? formValue.passwords.confirmPassword : undefined;
    const newCompany = new Company({_id: this.company._id, name, email});
    if (formValue.description) { newCompany.description = formValue.description; }
    if (formValue.website) { newCompany.website = formValue.website; }
    if (formValue.image) {
      newCompany.imagePath = formValue.image;
    }
    this.store.dispatch(new CompanyActions.UpdateSingleCompanyInDb({
      company: newCompany, deleteImage, password, confirmPassword }));
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onRemoveImage(image: HTMLInputElement) {
    this.companyForm.patchValue({ image: '' });
    image.value = '';
    this.imagePreview = '';
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
    this.store.dispatch(new CompanyActions.ClearError());
  }

  onTogglePasswords() {
    this.showPasswords = !this.showPasswords;
  }
}
