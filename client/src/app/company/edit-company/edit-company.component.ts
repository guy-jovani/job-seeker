import { Component, OnInit, OnDestroy, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import { Company } from '../company.model';
import * as fromApp from '../../store/app.reducer';
import * as UserActions from '../../user/store/user.actions';
import { AngularFireStorage } from '@angular/fire/storage';
import { environment } from 'environments/environment';

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
  messages: string[] = [];
  currUrl: string[] = null;
  images: File[] = null;
  imagesPath: string[] = null;
  profileImagePreview: { file: File, stringFile: string };
  uploadImagesPercent: number[];
  uploadProfilePercent: number;
  production = environment.production;

  constructor(
    private store: Store<fromApp.AppState>,
    private router: Router,
    private route: ActivatedRoute,
    private storage: AngularFireStorage
  ) {}

  ngOnInit() {
    this.companyForm = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      email: new FormControl(null, [Validators.required, Validators.email]),
      description: new FormControl(null),
      website: new FormControl(null),
      deleteImage: new FormControl(false),
    });

    this.authState = this.store.select('user')
      .subscribe(userState => {
        this.company = userState.user as Company;
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
        if (this.company) {
          this.initForm();
        }
      });
  }

  initForm() {
    this.companyForm.setValue({
      name: this.company.name,
      email: this.company.email,
      description: this.company.description || '',
      website: this.company.website || '',
      deleteImage: false,
    });
    this.images = [];
    this.imagesPath = [];
    this.uploadImagesPercent = [];
    this.company.imagesPath.forEach(imagePath => {
      this.imagesPath.push(imagePath);
      this.images.push(null);
      this.uploadImagesPercent.push(100);
    });
    this.profileImagePreview = {
      file: null, stringFile: this.company.profileImagePath as string
    };
    this.uploadProfilePercent = this.company.profileImagePath ? 100 : null;
  }

  onAddImage() {
    if (this.images.length < 6) {
      this.images.push(null);
      this.imagesPath.push('');
      this.uploadImagesPercent.push(0);
    }
  }

  trackImagesPath(index: number, item: ElementRef) {
    return index;
  }

  onCroppedEvent(images: { file: File, stringFile: string }, ind: number) {
    if (Number.isInteger(ind)) {
      this.images[ind] = images.file;
      this.imagesPath[ind] = images.stringFile;
      this.uploadImagesPercent[ind] = 0;
    } else {
      this.profileImagePreview = images;
      this.uploadProfilePercent = 0;
    }
  }

  async onSubmit() {
    if (this.companyForm.invalid) {
      return this.store.dispatch(new UserActions.UserFailure(['The form is invalid']));
    }
    const formValue = this.companyForm.value;
    const name = formValue.name;
    const email = formValue.email;
    const newCompany = new Company({_id: this.company._id, name, email});
    if (formValue.description) { newCompany.description = formValue.description; }
    if (formValue.website) { newCompany.website = formValue.website; }
    let firebaseImagesUrl = null;
    if (this.images) {
      if (this.production) {
        firebaseImagesUrl = await this.uploadProductionImages();
      } else {
        newCompany.imagesPath = this.images;
      }
    }
    if (this.profileImagePreview) {
      newCompany.profileImagePath = this.production ?
                                    await this.uploadProductionProfileImage() :
                                    this.profileImagePreview.file || this.profileImagePreview.stringFile || '';
    }

    this.store.dispatch(new UserActions.UpdateSingleCompanyInDb({
      company: newCompany, oldImagesPath: this.imagesPath.map(path => path.startsWith('http') ? path : ''),
      firebaseImagesUrl
    }));
  }

  private async uploadProductionImages() {
    let firebaseImagesUrl = [];
    for (const imgInd of this.images.keys()) { // company images
      if (this.images[imgInd]) {
        const uniqueName = this.getImageUniqueName(this.images[imgInd].name);
        const imageFBUrl = await this.fireBaseUpload(this.images[imgInd], uniqueName, imgInd);

        firebaseImagesUrl = firebaseImagesUrl ? [...firebaseImagesUrl, imageFBUrl] : [imageFBUrl];
      }
    }
    return firebaseImagesUrl;
  }

  private async uploadProductionProfileImage() {
    let imageFBUrl: string;
    if (this.profileImagePreview.file) { // company profile image
      const uniqueName = this.getImageUniqueName(this.profileImagePreview.file.name);
      imageFBUrl = await this.fireBaseUpload(this.profileImagePreview.file, uniqueName);
      return imageFBUrl;
    } else {
      return this.profileImagePreview.stringFile || '';
    }
  }

  private getImageUniqueName(name: string) {
    return name.split('.')[0] + '-' +
      new Date().toISOString().replace(/:/g, '-') + '.' +
      name.split('.')[1];
  }

  async fireBaseUpload(image: File, name: string, imgInd: number = null) {
    if (image) {
      const fileRef = this.storage.ref(environment.imagesFolder + name);
      const task = this.storage.upload(environment.imagesFolder + name, image);

      task.percentageChanges().subscribe(pre => {
        if (imgInd) {
          this.uploadImagesPercent[imgInd] = pre;
        } else {
          this.uploadProfilePercent = pre;
        }
      });

      await task.snapshotChanges().toPromise();
      return await fileRef.getDownloadURL().toPromise();
    }
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
    this.store.dispatch(new UserActions.ClearError());
  }
}
