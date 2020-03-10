import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, NgForm, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import { Position } from '../position.model';
import { switchMap } from 'rxjs/operators';
import { Company } from 'app/company/company.model';

import * as PositionActions from '../store/position.actions';


@Component({
  selector: 'app-edit-position',
  templateUrl: './edit-position.component.html',
  styleUrls: ['./edit-position.component.scss']
})
export class EditPositionComponent implements OnInit, OnDestroy {
  positionSub: Subscription;
  errorMessages: string[] = [];
  isLoading = false;
  positionForm: FormGroup;
  position: Position = null;
  index: number = null;
  company: Company = null;
  currUrl: string[] = null;

  constructor(
    private store: Store<fromApp.AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.positionForm = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      requirements: new FormArray([])
    });

    this.positionSub = this.route.params.pipe(
      switchMap(params => {
        this.currUrl = this.router.url.substring(1).split('/');
        this.index = params['index'];
        return this.store.select('user');
      }),
      switchMap(userState => {
        this.company = userState.user as Company;
        if (!isNaN(this.index)) { // /my-positions/:index/edit
          this.position = (userState.user as Company)['positions'][this.index];
          this.initForm();
        } // else /my-positions/create
        return this.store.select('position');
      })
    ).subscribe(positionState => {
      this.currUrl = this.router.url.substring(1).split('/');
      this.isLoading = positionState['loadingSingle'];
      if (this.currUrl[this.currUrl.length - 1] === 'edit' ||
          this.currUrl[this.currUrl.length - 1] === 'create') {
        if (positionState.messages) {
          this.errorMessages = [];
          for (const msg of positionState.messages) {
            this.errorMessages.push(msg);
          }
        } else {
          this.errorMessages = [];
        }
      }
    });
  }

  getControls() {
    return (this.positionForm.get('requirements') as FormArray).controls;
  }

  onAddRequirement(requirement: {requirement: string} = null) {
    (this.positionForm.get('requirements') as FormArray).push(
      new FormGroup({
        requirement: new FormControl(requirement ? requirement.requirement : null, [Validators.required]),
      }));
  }

  onRemoveRequirement(index: number) {
    (this.positionForm.get('requirements') as FormArray).removeAt(index);
  }

  initForm() {
    if (this.index !== null) {
      if (this.position.requirements) {
        this.position.requirements.forEach(req => {
          this.onAddRequirement(req);
        });
      }
      this.positionForm.patchValue({
        title: this.position.title,
        description: this.position.description,
      });
    }
  }
  onSubmit(form: NgForm) {
    if (form.invalid) {
      return this.store.dispatch(new PositionActions.PositionOpFailure(['The form is invalid']));
    }
    const newPosition = new Position({
      title: form.value.title, description: form.value.description,
      companyId: { _id: this.company._id, name: this.company.name }
    });
    if (form.value.requirements.length > 0) {
      newPosition.requirements = form.value.requirements;
    }
    if (this.position) {
      newPosition._id = this.position._id;
      this.store.dispatch(new PositionActions.UpdateSinglePositionInDb(newPosition));
    } else {
      this.store.dispatch(new PositionActions.CreatePositionInDb(newPosition));
    }
  }

  onCancel() {
    this.onClose();
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.positionSub) {
      this.positionSub.unsubscribe();
    }
    this.onClose();
  }

  onClose() {
    this.store.dispatch(new PositionActions.ClearError());
  }

}
