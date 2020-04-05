import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import { Job } from '../job.model';
import { switchMap } from 'rxjs/operators';
import { Company } from 'app/company/company.model';

import * as JobActions from '../store/job.actions';


@Component({
  selector: 'app-edit-job',
  templateUrl: './edit-job.component.html',
  styleUrls: ['./edit-job.component.scss']
})
export class EditJobComponent implements OnInit, OnDestroy {
  jobSub: Subscription;
  messages: string[] = [];
  isLoading = false;
  jobForm: FormGroup;
  job: Job = null;
  index: number = null;
  company: Company = null;
  currUrl: string[] = null;

  constructor(
    private store: Store<fromApp.AppState>,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.jobForm = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      requirements: new FormArray([])
    });

    this.jobSub = this.route.params.pipe(
      switchMap(params => {
        this.currUrl = this.router.url.substring(1).split('/');
        this.index = params['index'];
        return this.store.select('user');
      }),
      switchMap(userState => {
        this.company = userState.user as Company;
        if (!isNaN(this.index)) { // /my-jobs/:index/edit
          this.job = (userState.user as Company)['jobs'][this.index];
          this.initForm();
        } // else /my-jobs/create
        return this.store.select('job');
      })
    ).subscribe(jobState => {
      this.currUrl = this.router.url.substring(1).split('/');
      this.isLoading = jobState['loadingSingle'];
      if (this.currUrl[this.currUrl.length - 1] === 'edit' ||
          this.currUrl[this.currUrl.length - 1] === 'create') {
        if (jobState.messages) {
          this.messages = [];
          for (const msg of jobState.messages) {
            this.messages.push(msg);
          }
        } else {
          this.messages = [];
        }
      }
    });
  }

  getControls() {
    return (this.jobForm.get('requirements') as FormArray).controls;
  }

  onAddRequirement(requirement: {requirement: string} = null) {
    (this.jobForm.get('requirements') as FormArray).push(
      new FormGroup({
        requirement: new FormControl(requirement ? requirement.requirement : null, [Validators.required]),
      }));
  }

  onRemoveRequirement(index: number) {
    (this.jobForm.get('requirements') as FormArray).removeAt(index);
  }

  initForm() {
    if (this.index !== null) {
      if (this.job.requirements) {
        this.job.requirements.forEach(req => {
          this.onAddRequirement(req);
        });
      }
      this.jobForm.patchValue({
        title: this.job.title,
        description: this.job.description,
      });
    }
  }
  onSubmit(form: FormGroup) {
    if (form.invalid) {
      return this.store.dispatch(new JobActions.JobOpFailure(['The form is invalid']));
    }
    const newJob = new Job({
      title: form.value.title, description: form.value.description,
      company: { _id: this.company._id }
    });
    if (form.value.requirements.length > 0) {
      newJob.requirements = form.value.requirements;
    }
    if (this.job) {
      newJob._id = this.job._id;
      this.store.dispatch(new JobActions.UpdateSingleJobInDb(newJob));
    } else {
      this.store.dispatch(new JobActions.CreateJobInDb(newJob));
    }
  }

  onCancel() {
    this.onClose();
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  ngOnDestroy() {
    if (this.jobSub) {
      this.jobSub.unsubscribe();
    }
    this.onClose();
  }

  onClose() {
    this.store.dispatch(new JobActions.ClearError());
  }

}
