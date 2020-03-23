import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import {switchMap } from 'rxjs/operators';

import { Company } from '../company.model';
import * as fromApp from '../../store/app.reducer';
import * as CompanyActions from '../store/company.actions';

@Component({
  selector: 'app-edit-company',
  templateUrl: './edit-company.component.html',
  styleUrls: ['./edit-company.component.scss']
})
export class EditCompanyComponent implements OnInit, OnDestroy {
  authState: Subscription;
  company: Company;
  companyForm: FormGroup;
  isLoading = false;
  showPasswords = false;
  messages: string[] = [];
  currUrl: string[] = null;
  images: File[] = null;
  imagesPath: string[] = null;
  profileImagePreview: { file: File, stringFile: string };

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
      deleteImage: new FormControl(false),
      passwords: new FormGroup({
        password: new FormControl(null, [Validators.minLength(3)]),
        confirmPassword: new FormControl(null, [])
      }, this.checkPasswordEquality)
    });

    this.authState = this.store.select('user').pipe(
      switchMap(userState => {
        this.company = userState.user as Company;
        return this.store.select('company');
      }))
      .subscribe(companyState => {
        this.currUrl = this.router.url.substring(1).split('/');
        this.isLoading = companyState.loadingSingle;
        if (companyState.messages) {
          this.messages = [];
          for (const msg of companyState.messages) {
            this.messages.push(msg);
          }
        } else {
          this.messages = [];
        }
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
      passwords: {
        password: '',
        confirmPassword: '',
      },
      deleteImage: false,
    });
    this.images = [];
    this.imagesPath = [];
    this.company.imagesPath.forEach(imagePath => {
      this.imagesPath.push(imagePath);
      this.images.push(null);
    });
    this.profileImagePreview = {
      file: null, stringFile: this.company.profileImagePath as string
    };
  }

  onAddImage() {
    if (this.images.length < 6) {
      this.images.push(null);
      this.imagesPath.push('');
    }
  }

  trackImagesPath(index: number, item: ElementRef) {
    return index;
  }

  onCroppedEvent(images: { file: File, stringFile: string }, ind: number) {
    if (Number.isInteger(ind)) {
      this.images[ind] = images.file;
      this.imagesPath[ind] = images.stringFile;
    } else {
      this.profileImagePreview = images;
    }
  }

  onSubmit() {
    if (this.companyForm.invalid) {
      return this.store.dispatch(new CompanyActions.CompanyOpFailure(['The form is invalid']));
    }
    const formValue = this.companyForm.value;
    const name = formValue.name;
    const email = formValue.email;
    const password = formValue.passwords.password ? formValue.passwords.password : undefined;
    const confirmPassword = formValue.passwords.confirmPassword ? formValue.passwords.confirmPassword : undefined;
    const newCompany = new Company({_id: this.company._id, name, email});
    if (formValue.description) { newCompany.description = formValue.description; }
    if (formValue.website) { newCompany.website = formValue.website; }
    if (this.images) { // sending the files
      newCompany.imagesPath = this.images;
    }
    if (this.profileImagePreview) {
      newCompany.profileImagePath = this.profileImagePreview.file || this.profileImagePreview.stringFile;
    }
    this.store.dispatch(new CompanyActions.UpdateSingleCompanyInDb({
      company: newCompany, oldImagesPath: this.imagesPath.map(path => path.startsWith('http') ? path : ''), password, confirmPassword }));
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.authState) {
      this.authState.unsubscribe();
    }
    this.onClose();
  }

  onClose() {
    this.store.dispatch(new CompanyActions.ClearError());
  }

  onTogglePasswords() {
    this.showPasswords = !this.showPasswords;
  }
}
